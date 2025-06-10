// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const headers = { Authorization: Cypress.env('API_KEY') }

const getRandomDatasetName = () => Math.random().toString(36).slice(2) + Cypress.env('DATASET_NAME_SUFFIX')
const getRandomOrganizationName = () => Math.random().toString(36).slice(2) + Cypress.env('ORG_NAME_SUFFIX')

const apiUrl = (path) => {
  return `${Cypress.config().apiUrl}api/3/action/${path}`
}





Cypress.Commands.add('updatePackageMetadata', (datasetName) => {
  const request = cy.request({
    method: 'POST',
    url: apiUrl('package_patch'),
    headers: headers,
    body: {
      id: datasetName,
      notes: "Update notes"
    },
  })
})

Cypress.Commands.add("createGroupAPI", (name, parent = null) => {
  cy.request({
    method: "POST",
    url: apiUrl("group_create"),
    headers: headers,
    body: parent
      ? {
          name: name,
          title: name,
          description: "Some sub-topic description",
          groups: [{ name: parent }],
        }
      : {
          name: name,
          title: name,
          description: "Some group description",
        },
  });
});

Cypress.Commands.add("deleteGroupAPI", (name) => {
  cy.request({
    method: "POST",
    url: apiUrl("group_delete"),
    headers: headers,
    body: { id: name },
  });
});


Cypress.Commands.add('updateResourceMetadata', (datasetName) => {
  const request = cy.request({
    method: 'POST',
    url: apiUrl('resource_patch'),
    headers: headers,
    body: {
      id: datasetName,
      description: "Update description"
    },
  })
})



Cypress.Commands.add('purgeDataset', (datasetName) => {
  const request = cy.request({
    method: 'POST',
    url: apiUrl('dataset_purge'),
    headers: headers,
    body: {
      id: datasetName
    },
  })
})


// Command for frontend test sepecific
Cypress.Commands.add('createOrganizationAPI', (name) => {
  cy.request({
    method: 'POST',
    url: apiUrl('organization_create'),
    headers: headers,
    body: { 
      name: name,
      description: "Some organization description"
    },
  })
})

Cypress.Commands.add('deleteOrganizationAPI', (name) => {
  cy.request({
    method: 'POST',
    url: apiUrl('organization_delete'),
    headers: headers,
    body: { id: name },
  })
})

Cypress.Commands.add(
  "createDatasetAPI",
  (organization, name, isSubscribable, otherFields) => {
    const request = cy.request({
      method: "POST",
      url: apiUrl("package_create"),
      headers: headers,
      body: {
        owner_org: organization,
        name: name,
        license_id: "notspecified",
        draft: "false",
        tags: [{ display_name: "subscriable", name: "subscriable" }],
        ...otherFields,
      },
    });

    if (!isSubscribable) {
      request.then((response) => {
        const datasetId = response.body.result.id;
        cy.request({
          method: "POST",
          url: dataSubscriptionApiUrl(`nonsubscribable_datasets/${datasetId}`),
          headers: headers,
        });
      });
    }
  }
);

Cypress.Commands.add('createResourceAPI', (dataset, resource) => {
  const request = cy.request({
    method: 'POST',
    url: apiUrl('datastore_create'),
    headers: headers,
    body: {
      resource: {
        package_id: dataset,
        name: resource,
        format: 'CSV',
      },
      records: [
        {
          name: ' Jhon Mayer',
          age: 29,
        },
      ],
      force: 'True',
    },
  })
})


Cypress.Commands.add('updateResourceRecord', (resource) => {
  const request = cy.request({
    method: 'POST',
    url: apiUrl('datastore_upsert'),
    headers: headers,
    body: {
      resource_id : resource,
      records: [
        {
          name: 'Jhon lenon',
          age: 60
        },
      ],
      method:"insert",
      force: true
    },
  })
})


Cypress.Commands.add('deleteDatasetAPI', (name) => {
  const request = cy.request({
    method: 'POST',
    url: apiUrl('package_delete'),
    headers: headers,
    body: {
      id: name
    },
  })
})

Cypress.Commands.add('datasetCount',  (name) => {
  return cy.request({
    method: 'GET',
    url: apiUrl('package_search'),
    headers: headers,
    body: {
      rows: 1,
    },
  }).then ((res) => {
    return res.body.result.count
  })
})

Cypress.Commands.add('groupCount',  (name) => {
  return cy.request({
    method: 'GET',
    url: apiUrl('organization_list'),
    headers: headers,
  }).then ((res) => {
    return res.body.result.length
  })
})

Cypress.Commands.add('facetFilter', (facetType,facetValue ) => {
  return cy.request({
    method: 'GET',
    url: apiUrl('package_search'),
    headers: headers,
    qs: {
      fq: `${facetType}:${facetValue}`
    }
  }).then ((res) => {
    return res.body.result.count
  })
})

Cypress.Commands.add('prepareFile', (dataset, file, format) => {
  cy.fixture(`${file}`, 'binary')
    .then(Cypress.Blob.binaryStringToBlob).then((blob) => {
      var data = new FormData();
      data.append("package_id", `${dataset}`);
      data.append("name", `${file}`);
      data.append("format", `${format}`);
      data.append("description", "Lorem Ipsum is simply dummy text of the printing and type");
      data.append("upload", blob, `${file}`);
      var xhr = new XMLHttpRequest();
      xhr.withCredentials = true;
      xhr.open("POST", apiUrl('resource_create'));
      xhr.setRequestHeader(
        "Authorization", headers.Authorization,
      );
      xhr.send(data);
  })
})

Cypress.Commands.add('datasetMetadata', (dataset) => {
  return cy.request({
    method: 'GET',
    url: apiUrl('package_show'),
    headers: headers,
    qs: {
      id: dataset
    }
  }).then ((res) => {
    return res.body.result
  })
})


Cypress.Commands.add('iframe', { prevSubject: 'element' }, ($iframe) => {
  const $iframeDoc = $iframe.contents()
  const findBody = () => $iframeDoc.find('body')
  if ($iframeDoc.prop('readyState') === 'complete') return findBody()
  return Cypress.Promise((resolve) => $iframe.on('load', () => resolve(findBody())))
})