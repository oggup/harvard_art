const BASE_URL = 'https://api.harvardartmuseums.org';
const KEY = 'apikey=07dffc48-e68d-40b5-8ec9-cf4128637d97'; // USE YOUR KEY HERE

async function fetchObjects() {
    const url = `${ BASE_URL }/object?${ KEY }`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;  
      console.log(data);

    } catch (error) {
      console.error("whoops");
    };
};


async function fetchAllCenturies() {
    const url = `${ BASE_URL }/century?${ KEY }&size=100&sort=temporalorder`;
    if (localStorage.getItem('centuries')) {
        return JSON.parse(localStorage.getItem('centuries'));
    };
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      const records = data.records;
      localStorage.setItem('centuries',json.stringify(records));

        
      return records;
    } catch (error) {
      console.error(error);
    };
};

async function fetchAllClassifications() {
    const url = `${ BASE_URL }/classification?${ KEY }&size=100&sort=name`;
    if (localStorage.getItem('classifications')) {
        return JSON.parse(localStorage.getItem('classifications'));
    };
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      const records = data.records;
      localStorage.setItem('classifications', json.stringfy(records));

        
      return records;
    } catch (error) {
      console.error(error);
    };
};

async function prefetchCategoryLists() {
    try {
      const [classifications, centuries] = await Promise.all([fetchAllClassifications(), fetchAllCenturies()]);
        // This provides a clue to the user, that there are items in the dropdown
        $('.classification-count').text(`(${ classifications.length })`);

        classifications.forEach(classification => {
        // append a correctly formatted option tag into
        // the element with id select-classification
        $('#select-classification').append($(`<option value="value text">${classification.name}</option>`));
        });
  
        // This provides a clue to the user, that there are items in the dropdown
        $('.century-count').text(`(${ centuries.length }))`);
  
        centuries.forEach(century => {
         // append a correctly formatted option tag into
         // the element with id select-century
         $('#select-century').append($(`<option value="value text">${century.name}</option>`));
        });
   
      
    } catch (error) {
      console.error(error);
    };
};

function buildSearchString(){
    const rootUrl = `https://api.harvardartmuseums.org/object?${KEY}`
    const terms = [... $('#search select')].map( function (element){
    return `${$(`element`).attr('name')}=${$(`element`).val()}`;
    }).join('&');
    const keywords = `keyword=${$('#keywords').val()}`
    return `${rootUrl}&${terms}&${keywords}`;

};

function onFetchStart() {
    $('#loading').addClass('active');
};
  
function onFetchEnd() {
    $('#loading').removeClass('active');
};

function renderPreview(record) {
  // grab description, primaryimageurl, and title from the record
  const { description, primaryimageurl, title} = record;
  /*
  Template looks like this:
  */
  return $(`<div class="object-preview">
    <a href="#">
      <img src="${primaryimageurl}" />
      <h3>${title}</h3>
      <h3>${description}</h3>
    </a>
  </div>`).data('record', record);
};
  /*
  Some of the items might be undefined, if so... don't render them

  With the record attached as data, with key 'record'
  */

  // return new element
function updatePreview(records) {
  const root = $('#preview');
  $(`.results`).empty();
  records.forEach(function (record){
    return root.append(renderPreview(record));
  });

  // grab the results element, it matches .results inside root
  // empty it
  // loop over the records, and append the renderPreview
};


$('#search').on('submit', async function (event) {
    // prevent the default
    event.preventDefault();
    onFetchStart();    
    try {
      // get the url from `buildSearchString`
      // fetch it with await, store the result
      // log out both info and records when you get them
        const response = await fetch(buildSearchString());
        const {info, records} = await response.json();
        updatePreview(records);
        console.log(info);
        console.log(records);
    } catch (error) {
      // log out the error
    } finally {
        onFetchEnd();
    }
});

function bootstrap(){
    fetchObjects();
    fetchAllCenturies();
    fetchAllClassifications();
    prefetchCategoryLists();
}
bootstrap();