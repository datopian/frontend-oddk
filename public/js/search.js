/**
 * drawdown.js
 * (c) Adam Leggett
 */


;function markdown(src) {

  var rx_lt = /</g;
  var rx_gt = />/g;
  var rx_space = /\t|\r|\uf8ff/g;
  var rx_escape = /\\([\\\|`*_{}\[\]()#+\-~])/g;
  var rx_hr = /^([*\-=_] *){3,}$/gm;
  var rx_blockquote = /\n *&gt; *([^]*?)(?=(\n|$){2})/g;
  var rx_list = /\n( *)(?:[*\-+]|((\d+)|([a-z])|[A-Z])[.)]) +([^]*?)(?=(\n|$){2})/g;
  var rx_listjoin = /<\/(ol|ul)>\n\n<\1>/g;
  var rx_highlight = /(^|[^A-Za-z\d\\])(([*_])|(~)|(\^)|(--)|(\+\+)|`)(\2?)([^<]*?)\2\8(?!\2)(?=\W|_|$)/g;
  var rx_code = /\n((```|~~~).*\n?([^]*?)\n?\2|((    .*?\n)+))/g;
  var rx_link = /((!?)\[(.*?)\]\((.*?)( ".*")?\)|\\([\\`*_{}\[\]()#+\-.!~]))/g;
  var rx_table = /\n(( *\|.*?\| *\n)+)/g;
  var rx_thead = /^.*\n( *\|( *\:?-+\:?-+\:? *\|)* *\n|)/;
  var rx_row = /.*\n/g;
  var rx_cell = /\||(.*?[^\\])\|/g;
  var rx_heading = /(?=^|>|\n)([>\s]*?)(#{1,6}) (.*?)( #*)? *(?=\n|$)/g;
  var rx_para = /(?=^|>|\n)\s*\n+([^<]+?)\n+\s*(?=\n|<|$)/g;
  var rx_stash = /-\d+\uf8ff/g;

  function replace(rex, fn) {
      src = src.replace(rex, fn);
  }

  function element(tag, content) {
      return '<' + tag + '>' + content + '</' + tag + '>';
  }

  function blockquote(src) {
      return src.replace(rx_blockquote, function(all, content) {
          return element('blockquote', blockquote(highlight(content.replace(/^ *&gt; */gm, ''))));
      });
  }

  function list(src) {
      return src.replace(rx_list, function(all, ind, ol, num, low, content) {
          var entry = element('li', highlight(content.split(
              RegExp('\n ?' + ind + '(?:(?:\\d+|[a-zA-Z])[.)]|[*\\-+]) +', 'g')).map(list).join('</li><li>')));

          return '\n' + (ol
              ? '<ol start="' + (num
                  ? ol + '">'
                  : parseInt(ol,36) - 9 + '" style="list-style-type:' + (low ? 'low' : 'upp') + 'er-alpha">') + entry + '</ol>'
              : element('ul', entry));
      });
  }

  function highlight(src) {
      return src.replace(rx_highlight, function(all, _, p1, emp, sub, sup, small, big, p2, content) {
          return _ + element(
                emp ? (p2 ? 'strong' : 'em')
              : sub ? (p2 ? 's' : 'sub')
              : sup ? 'sup'
              : small ? 'small'
              : big ? 'big'
              : 'code',
              highlight(content));
      });
  }

  function unesc(str) {
      return str.replace(rx_escape, '$1');
  }

  var stash = [];
  var si = 0;

  src = '\n' + src + '\n';

  replace(rx_lt, '&lt;');
  replace(rx_gt, '&gt;');
  replace(rx_space, '  ');

  // blockquote
  src = blockquote(src);

  // horizontal rule
  replace(rx_hr, '<hr/>');

  // list
  src = list(src);
  replace(rx_listjoin, '');

  // code
  replace(rx_code, function(all, p1, p2, p3, p4) {
      stash[--si] = element('pre', element('code', p3||p4.replace(/^    /gm, '')));
      return si + '\uf8ff';
  });

  // link or image
  replace(rx_link, function(all, p1, p2, p3, p4, p5, p6) {
      stash[--si] = p4
          ? p2
              ? '<img src="' + p4 + '" alt="' + p3 + '"/>'
              : '<a href="' + p4 + '">' + unesc(highlight(p3)) + '</a>'
          : p6;
      return si + '\uf8ff';
  });

  // table
  replace(rx_table, function(all, table) {
      var sep = table.match(rx_thead)[1];
      return '\n' + element('table',
          table.replace(rx_row, function(row, ri) {
              return row == sep ? '' : element('tr', row.replace(rx_cell, function(all, cell, ci) {
                  return ci ? element(sep && !ri ? 'th' : 'td', unesc(highlight(cell || ''))) : ''
              }))
          })
      )
  });

  // heading
  replace(rx_heading, function(all, _, p1, p2) { return _ + element('h' + p1.length, unesc(highlight(p2))) });

  // paragraph
  replace(rx_para, function(all, content) { return element('p', unesc(highlight(content))) });

  // stash
  replace(rx_stash, function(all) { return stash[parseInt(all)] });

  return src.trim();
};

// Search

const searchField = document.getElementById('searchInputHome');
const resultsList = document.getElementById('searchSelectHome');
let searchResults = getSearchPackages();
const currentLanguage = document.querySelector('html').getAttribute('lang'); // 'da';
const formatColors = {
  CSV: '#ffca00',
  XLSX:'#3CBC8D',
  XLS:'#3CBC8D',
  JSON:'blue',
  GeoJSON:'#2CAAF9',
  WFS:'#08389c',
  PDF:'#ff1010',
  SHP:'violet',
  HTML:'#333',
  KML:'gray',
  ODS:'gray'
}
const advancedSearchTextDict = {
  da: 'Avanceret søgning',
  en: 'Advanced search',
  fr: 'Recherche avancée'
}
const searchResultsTextDict = {
  plural: {
    da: 'resultater',
    en: 'results',
    fr: 'résultats'
  },
  singular: {
    da: 'resultat',
    en: 'result',
    fr: 'résultat'
  }
}
const advancedSearch = translate(null, 'search', currentLanguage); //'Avanceret søgning';

function translate(result, type='title', lang='da', plural=false) {

  if (type == 'search') {
    return advancedSearchTextDict[lang];
  }

  if (type == 'results') {
    let searchResultsText = '';

    if (plural === true) {
      let pluralResult = searchResultsTextDict.plural[lang];

      if (pluralResult) {
        searchResultsText = pluralResult;
      }
    } else {
      let singularResult = searchResultsTextDict.singular[lang];

      if (singularResult) {
        searchResultsText = singularResult;
      }
    }
    return searchResultsText;
  }

  let notes = ''

  if (type == 'title') {
    if (result.title_translated) {
      notes = result.title_translated[currentLanguage] || result.title;
    }
  } else if (type == 'notes') {
    if (result.notes_translated) {
      notes = result.notes_translated[currentLanguage] || result.notes;
    }
  }

  if (notes && notes.length > 80) {
    notes = notes.slice(0, 80) + '...';
  } else {
    notes = notes;
  }

  if (notes !== undefined) {
    return notes; // markdown(notes);
  } else {
    return '';
  }
}

function updateResults(searchTerm) {
  var filteredResults = searchResults.filter(result => {
    return result.title.toLowerCase().includes(searchTerm.toLowerCase()) && searchTerm.length > 0;
  });

  var numResults = filteredResults.length;

  filteredResults = filteredResults.slice(0, 5);

  var resultList = filteredResults
    .map(result => `
    <li class="search-card" 
      style="
        list-style-type:none;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 10px;
        padding-left: 10px;
        padding-top: 10px;
      ">
      <a href="/${result.organization.name || 'dataset'}/${result.name}" class="block" 
      style="
        text-decoration: none;
        display: block;
        width: 100%;
        height: 100%;
        padding-bottom: 10px;
        padding-left: 10px;
        padding-top: 10px;
      "
      tabindex="0"
      >
      <div>
        <h3 class="font-bold" style="font-size: 1.25rem;">
          <span class="text-primary">${translate(result, 'title') || result.name}</span>
        </h3>
        <div class="markdown-content leading-relaxed">
          <span style="color: #4e4e4f; font-weight: 400;">
            ${translate(result, 'notes')}
          </span>
        </div>
      </div>
      <ul class="mt-2">
        ${result.resources.map(resource => `
          <li class="inline">
            <span class="bg-gray-600 text-sm text-gray-100 px-2 py-1" 
              style="background:${formatColors[resource.format] || 'gray'};
              width: auto;
            ">${resource.format}</span>
          </li>
        `).join('')}
          <li class="inline">
            <span class="px-2 py-1 font-normal mt-2" style="color: #4E4E4F; font-weight: 400;" style="position: relative;">
              ${result.organization.title || result.organization.name || 'dataset' }
            </span>
          </li>
      </ul>
      </a>
    </li>`)
    .join('');

  if (numResults > 0) {
    resultList = `<li class="search-card-results"
      style="
        list-style-type:none;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 10px;
        padding-left: 10px;
        padding-top: 10px;
      ">
      <div class="block"
      style="
        text-decoration: none;
        display: block;
        width: 100%;
        height: 100%;
        padding-bottom: 10px;
        padding-left: 10px;
        padding-top: 10px;
      "
      tabindex="0"
      >
        <div>
          <p style="font-size: 1.2rem;"
           >${numResults} ${numResults > 1 ? translate(null, 'results', currentLanguage, true) : translate(null, 'results', currentLanguage)}</p>
        </div>
      </div>
    </li>` + resultList;
  } else {
    resultList = `<li class="search-card-results"
      style="
        list-style-type:none;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 10px;
        padding-left: 10px;
        padding-top: 10px;
      ">
      <div class="block"
      style="
        text-decoration: none;
        display: block;
        width: 100%;
        height: 100%;
        padding-bottom: 10px;
        padding-left: 10px;
        padding-top: 10px;
      "
      tabindex="0"
      >
        <div>
          <p style="font-size: 1.2rem;"
          >No results for "${searchTerm}"</h2>
        </div>
      </div>
    </li>` + resultList;
  }

  resultList = resultList + `<li class="search-card-results"
      style="
        list-style-type:none;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 10px;
        padding-left: 10px;
        padding-top: 10px;
      ">
      <div class="block"
        style="
          text-decoration: none;
          display: block;
          width: 100%;
          height: 100%;
          padding-bottom: 10px;
          padding-left: 10px;
          padding-top: 10px;
        "
        tabindex="0"
      >
        <div>
          <a href="/search" 
            style="
              font-size: 1.2rem;
              color: #4e4e4f;
              font-weight: 400;
              text-decoration: underline;
          ">
            ${translate(null, 'search', currentLanguage)}
          </a>
        </div>
      </div>
    </li>`;

  resultsList.innerHTML = `<ul 
    style="
      background: white;
      display: block;
      border: 1px solid #4E4E4F;
    ">${resultList}</ul>`;
}

searchField.addEventListener('input', event => {
  const searchTerm = event.target.value;
  updateResults(searchTerm);
});

function getSearchPackages() {
  var packages = [];

  $.ajax({
    url: '/api/packages',
    type: 'GET',
    async: false,
    success: function(data) {
      packages = data;
    }
  });

  return packages;
}
