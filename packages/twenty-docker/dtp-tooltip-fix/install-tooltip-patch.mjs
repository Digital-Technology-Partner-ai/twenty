import { readFileSync, writeFileSync } from 'node:fs';

const indexPath =
  process.env.TWENTY_FRONTEND_INDEX_PATH ??
  '/app/packages/twenty-server/dist/front/index.html';
const stylesheetName = 'dtp-overflow-tooltip-20260924.css';
const stylesheetLink = `    <link rel="stylesheet" href="/${stylesheetName}">`;
const indexHtml = readFileSync(indexPath, 'utf8');

if (indexHtml.includes(stylesheetName)) {
  process.exit(0);
}

if (indexHtml.split('</head>').length !== 2) {
  throw new Error(
    'Expected exactly one closing head tag in the frontend index',
  );
}

writeFileSync(
  indexPath,
  indexHtml.replace('  </head>', `${stylesheetLink}\n  </head>`),
);
