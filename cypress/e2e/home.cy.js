const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const org1 = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org2 = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName1 = `${uuid()}dataset1${Cypress.env("DATASET_NAME_SUFFIX")}`;
const datasetName2 = `${uuid()}dataset2${Cypress.env("DATASET_NAME_SUFFIX")}`;
const datasetName3 = `${uuid()}dataset3${Cypress.env("DATASET_NAME_SUFFIX")}`;
const datasetName4 = `${uuid()}dataset4${Cypress.env("DATASET_NAME_SUFFIX")}`;

const group1 = `${uuid()}${Cypress.env("GROUP_SUFFIX")}`;
const group2 = `${uuid()}${Cypress.env("GROUP_SUFFIX")}`;

describe('Frontend ODDK Homepage Test', () => {

  before(() => {
    // Create two organizations
    cy.createOrganizationAPI(org1);
    cy.createOrganizationAPI(org2);

    // Create two groups
    cy.createGroupAPI(group1);
    cy.createGroupAPI(group2);

    // Create two datasets for org1
    cy.createDatasetAPI(org1, datasetName1, true, {
      notes: "test dataset 1",
      visibility_type: "public",
      groups: [{ name: group1 }]
    });
    cy.createDatasetAPI(org1, datasetName2, true, {
      notes: "test dataset 2",
      visibility_type: "public",
      groups: [{ name: group2 }]
    });

    // Create two datasets for org2
    cy.createDatasetAPI(org2, datasetName3, true, {
      notes: "test dataset 3",
      visibility_type: "public",
      groups: [{ name: group1 }]
    });
    cy.createDatasetAPI(org2, datasetName4, true, {
      notes: "test dataset 4",
      visibility_type: "public",
      groups: [{ name: group2 }]
    });

    // Create a resource for one of the datasets (datasetName1)
    cy.prepareFile(datasetName1, "example.csv", "text/csv");
  });

  it('should display the homepage and check if groups and organization exist', () => {
    cy.visit('/');
    
    cy.contains("Groups")
    cy.get('ul.home-groups li.home-groups_item').should('have.length.at.least', 2);

    cy.get('button').contains('Organizations').click();
    cy.get('ul.home-groups li.home-groups_item').should('have.length.at.least', 2);
    
  });

  it('should check if datasets are listed under the correct organizations', () => {
    cy.visit(`/${org1}`);
    cy.contains(org1);
    cy.contains(datasetName1);
    cy.contains(datasetName2);
  }
  );

  it('should check if datasets are listed under the correct groups', () => {
    cy.visit(`/collections/${group1}`);
    cy.contains(group1);
    cy.contains(datasetName1);
    cy.contains(datasetName3);

    cy.visit(`/collections/${group2}`);
    cy.contains(group2);
    cy.contains(datasetName2);
    cy.contains(datasetName4);
  }
  );

  it("should test search page", ()=>{
    cy.visit("/search")
    cy.get('input[name="q"]').type(datasetName1).type("{enter}");
    
    cy.contains(datasetName1);
    
  });

  it("should test filters in search page", () => {
    cy.visit("/search");
    cy.get('.search-filters').should('exist');
    cy.get('.search-filters').find('a').contains(org1).click();
    cy.contains("Organizations:");
  }
  );

  it("should test dataset details page", () => {
    cy.visit(`/${org1}/${datasetName1}`);
    cy.contains(datasetName1);
    cy.contains("test dataset 1");
    cy.contains("example.csv");
    cy.contains("Download");
  }
  );


  after(() => {
    // Delete in reverse order: resources, datasets, groups, organizations
    cy.deleteDatasetAPI(datasetName1);
    cy.deleteDatasetAPI(datasetName2);
    cy.deleteDatasetAPI(datasetName3);
    cy.deleteDatasetAPI(datasetName4);
    
    cy.deleteGroupAPI(group1);
    cy.deleteGroupAPI(group2);
    
    cy.deleteOrganizationAPI(org1);
    cy.deleteOrganizationAPI(org2);
  });
});