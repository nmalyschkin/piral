const { getCodes, getName, generateFile, generated, generatedName } = require('./paths');
const { render } = require('./markdown');
const { docRef } = require('./utils');

function getRoute(name) {
  return (name && `/reference/codes/${name}`) || '';
}

module.exports = function() {
  const codes = getCodes();

  const imports = codes
    .map(file => {
      const { mdValue } = render(file, generated);
      const name = getName(file);
      const route = getRoute(name);
      const pageMeta = {
        link: route,
        source: file,
        title: name,
      };

      this.addDependency(file, { includedInParent: true });

      generateFile(
        `code-${name}`,
        `// ${JSON.stringify(pageMeta)}
import * as React from 'react';
import { Link } from 'react-router-dom';
import { PageContent, Markdown } from '../../scripts/components';

const link = "${docRef(file)}";
const html = ${mdValue};

export default () => (
  <PageContent>
    <Link to="/reference/codes" className="nav-link">Codes</Link> /
    <Markdown content={html} link={link} />
  </PageContent>
);`,
        'jsx',
      );
      return `
      {
        id: '${name}',
        route: '${route}',
        page: lazy(() => import('./${generatedName}/code-${name}')),
      }`;
    });

  return imports;
};
