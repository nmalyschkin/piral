const { getDocs, getReferences, getName, generated, generatedName, generateFile } = require('./paths');
const { docRef, capitalize } = require('./utils');
const { render } = require('./markdown');

function getRoute(name) {
  return (name && `/reference/documentation/${name}`) || '';
}

module.exports = function() {
  const docs = [...getDocs(), ...getReferences()];

  const imports = docs.map(file => {
    const name = getName(file);
    const route = getRoute(name);
    const title = capitalize(name);
    const { mdValue } = render(file, generated);
    const pageMeta = {
      link: route,
      source: file,
      title,
    };

    this.addDependency(file, { includedInParent: true });

    generateFile(
      `ref-${name}`,
      `// ${JSON.stringify(pageMeta)}
import * as React from 'react';
import { PageContent, Markdown } from '../../scripts/components';

const link = "${docRef(file)}";
const html = ${mdValue};

export default () => (
  <PageContent>
    <Markdown content={html} link={link} />
  </PageContent>
);`,
      'jsx',
    );

    return `
    {
      id: '${name}',
      title: '${title}',
      route: '${route}',
      page: lazy(() => import('./${generatedName}/ref-${name}')),
    }`;
  });

  return imports;
};
