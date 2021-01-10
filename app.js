const BASE_URL = 'https://api.harvardartmuseums.org';
const KEY = 'apikey=07dffc48-e68d-40b5-8ec9-cf4128637d97';

function onFetchStart() {
  $('#loading').addClass('active');
};

function onFetchEnd() {
  $('#loading').removeClass('active');
};

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
    localStorage.setItem('centuries',JSON.stringify(records));
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
    localStorage.setItem('classifications', JSON.stringify(records));
    return records;
  } catch (error) {
      console.error(error);
  }; 
};

async function prefetchCategoryLists() {
  try {
    const [classifications, centuries] = await Promise.all([
       fetchAllClassifications(),
       fetchAllCenturies()
      ]);
     
      $('.classification-count').text(`(${classifications.length})`);
      classifications.forEach(classification => {
          $('#select-classification').append($(`<option value="${classification.name}">${classification.name}</option>`));
      });
      $('.century-count').text(`(${centuries.length})`);
      centuries.forEach(century => {          
          $('#select-century').append($(`<option value="${century.name}">${century.name}</option>`));
      });
  } catch (error) {
      console.error(error);
  };
};

function buildSearchString() {
  const selectClass = $('#select-classification').val()
  const selectCentury = $('#select-century').val()
  const keyWord = $('#keywords').val()
  const url = `${BASE_URL}/object?${KEY}&classification=${selectClass}&century=${selectCentury}&keyword=${keyWord}`;
  return url;
};

function renderPreview(record) {
  const { description, primaryimageurl, title} = record;
  return $(`<div class="object-preview">
    <a href="#">
      ${primaryimageurl ? `<img src="${primaryimageurl}" />` : ""}
      ${title ? `<h3>${title}</h3>` : ""}
    </a>
  </div>`).data('record', record);
};

function updatePreview(records, info) {
  const root = $('#preview');
  if (info.next) {
      $('.next').data('url', info.next).attr('disabled', false)
  } else {
      $('.next').data('url', null).attr('disabled', true)
  };
  if (info.prev) {
      $('.prev').data('url', info.prev).attr('disabled', false)
  } else {
      $('.prev').data('url', null).attr('disabled', true)
  };
  const results = root.find('.results');
  results.empty();
  results.append(records.map(renderPreview));
};

function photosHTML(images, primaryimageurl) {
  if (images && images.length > 0 ){
    return images.map(function(image){
      return `<img src="${ image.baseimageurl }" />`});

  } else if ( primaryimageurl){
    return `<img src = "${primaryimageurl}"/>`;  
  } else {
    return "";
  };
};

function renderFeature(record) {
  const {title, dated, description, culture, style, technique, medium, dimensions, people, department, division, contact, creditline ,images, primaryimageurl} = record;
 return $(` <div class="object-feature">
        <header>
        <h3>${ title }<h3>
        <h4>${ dated }</h4>
        </header>
        <section class="facts">
        ${ factHTML("Description", description,) }
        ${ factHTML("Culture", culture, 'culture') }
        ${ factHTML("Technique", technique, 'technique') }
        ${ factHTML("Medium", medium, 'medium') }
        ${ factHTML("Dimensions", dimensions) }
        ${record.people ? record.people.map(function(person) {
              return factHTML('Person', person.displayname, 'person');
              }).join(''):''}
        ${ factHTML("Department", department) }
        ${ factHTML("Division", division) }
        ${ factHTML('Contact', `<a target="_blank" href="mailto:${ contact }">${ contact }</a>`) }
        ${ factHTML("Credit Line", creditline) }
        </section>
        <section class="photos">
        ${ photosHTML(record.images, record.primaryimageurl) }
        </section>
        </div>`);
};

function searchURL(searchType, searchString) {
    return `${ BASE_URL }/object?${ KEY }&${ searchType}=${ searchString }`;
};
  
function factHTML(title, content, searchTerm = null) {
  if (!content){
      return '';
    } 
    return `  <span class="title">${ title }</span>
    <span class="content">${searchTerm && content ? `<a href="${searchURL(content, searchTerm)}${encodeURI(content.split('-').join('|')) 
    }">${content}</a>`: content}
    </span>`
};

$('#search').on('submit', async function (event) {
  event.preventDefault();
  onFetchStart();
  try {
      const encodeUrl = encodeURI(buildSearchString())
      const response = await fetch(encodeUrl);
      const {info, records} = await response.json();
      console.log(info, records)
      updatePreview(records, info);
  } catch (error) {
      console.error(error);
  } finally {
      onFetchEnd();
  };
});

$('#preview .next, #preview .previous').on('click', async function () {
  onFetchStart();
  try {
      let url = $(this).data('url')
      const response = await fetch(url);
      const {info, records }= await response.json();
      updatePreview(records, info);
  } catch (error) {
      console.error(error);
  } finally {
      onFetchEnd();
  };        
});

$('#preview').on('click', '.object-preview', function (event) {
  event.preventDefault();
  const objectPreview = $(this).closest('.object-preview');
  const objectPreviewData = objectPreview.data('record');
  console.log(objectPreviewData);
  $('#feature').html(renderFeature(objectPreviewData));
});

$('#feature').on('click', 'a', async function (event) {
  // read href off of $(this) with the .attr() method

  // prevent default

  // call onFetchStart
  // fetch the href
  // render it into the preview
  // call onFetchEnd
});
function bootstrap(){
    fetchObjects();
    prefetchCategoryLists();
}
bootstrap();