class elementHandler {
  
  element(element) {

    //Changes the title of the web page
    if(element.tagName === 'title'){
      element.setInnerContent('Go Bulldogs!')
    }

    //Changes main title of the page
    if(element.tagName === 'h1' && element.getAttribute('id') === 'title'){
      element.setInnerContent('Joseph Hnatek')
    }

    //Changes the description paragraph
    if(element.tagName === 'p' && element.getAttribute('id') === 'description'){
      element.setInnerContent('Double Majoring in Computer Science and Cognitive Science at UMN - Duluth. Check out my Github while you are here!')
    }

    //Changes call to action link and text
    if(element.tagName === 'a' && element.getAttribute('id') === 'url'){
      const item = element.getAttribute('href')
      element.setAttribute('href', item.replace("https://cloudflare.com", "https://github.com/jmh07"));
      element.setInnerContent('Click to visit github.com/jmh07')
    }
  }
}

const rewriter = new HTMLRewriter()
  .on('*', new elementHandler())


/**
 * Respond with one of the two variant pages
 * @param {Request} request
 */
async function handleRequest(request) {

  const cookie = request.headers.get('Cookie');
  let isSiteCookie = false;
  let siteToVisit = null;
  
  if(cookie){

    let cookies = cookie.split(';')

    cookies.forEach(i => {

      let cookieName = i.split('=')[0].trim()

      if(cookieName === 'site'){

        let siteVal = i.split('=')[1]
        siteToVisit = siteVal;
        isSiteCookie = true;

      }
    })
  }

  if(!isSiteCookie){

    let urlVariants = "https://cfw-takehome.developers.workers.dev/api/variants";
    let resultOfVariants = [];


    await fetch(urlVariants, {
      method: 'GET',
      headers: { 'content-type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
      resultOfVariants = data["variants"];
    })

    let randomNumber = [Math.floor(Math.random() * resultOfVariants.length)];

    siteToVisit = resultOfVariants[randomNumber];

}

  const res = await fetch(siteToVisit);
  let response = rewriter.transform(res);

  if(!isSiteCookie) {
    const cookieDetails = `site=${siteToVisit}; Expires=Mon, 20 Apr 2020 12:00:00 CDT; Path='/';`
    response.headers.set('Set-Cookie', cookieDetails);
  }

  return response;

}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
})