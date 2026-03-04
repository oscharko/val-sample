import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const COVERAGE_FILE_PATH = path.resolve(process.cwd(), 'coverage', 'coverage-final.json');

const GLOBAL_THRESHOLDS = {
  statements: 90,
  branches: 75,
  functions: 90,
  lines: 90,
};

const CRITICAL_FILE_THRESHOLDS = [
  {
    suffix: path.normalize('src/api.ts'),
    thresholds: {
      statements: 90,
      branches: 75,
      functions: 100,
      lines: 90,
    },
  },
  {
    suffix: path.normalize('src/hooks/useInvestmentFinancingSubmission.ts'),
    thresholds: {
      statements: 90,
      branches: 85,
      functions: 100,
      lines: 90,
    },
  },
];

const toTotals = (entries) => {
  return entries.reduce(
    (accumulator, [covered, total]) => {
      return {
        covered: accumulator.covered + covered,
        total: accumulator.total + total,
      };
    },
    { covered: 0, total: 0 },
  );
};

const toPercentage = ({ covered, total }) => {
  if (total === 0) {
    return 100;
  }

  return (covered / total) * 100;
};

const collectCounterTotals = (counterMap) => {
  const values = Object.values(counterMap);
  return toTotals(values.map((hitCount) => [hitCount > 0 ? 1 : 0, 1]));
};

const collectBranchTotals = (branchCounterMap) => {
  const branchCounts = Object.values(branchCounterMap).flatMap((branchHits) => branchHits);
  return toTotals(branchCounts.map((hitCount) => [hitCount > 0 ? 1 : 0, 1]));
};

const collectMetricsFromFileCoverage = (fileCoverage) => {
  const statements = collectCounterTotals(fileCoverage.s ?? {});
  const branches = collectBranchTotals(fileCoverage.b ?? {});
  const functions = collectCounterTotals(fileCoverage.f ?? {});
  const lines = collectCounterTotals(fileCoverage.l ?? fileCoverage.s ?? {});

  return {
    statements,
    branches,
    functions,
    lines,
  };
};

const sumMetricTotals = (coverages) => {
  return coverages.reduce(
    (accumulator, coverage) => {
      return {
        statements: {
          covered: accumulator.statements.covered + coverage.statements.covered,
          total: accumulator.statements.total + coverage.statements.total,
        },
        branches: {
          covered: accumulator.branches.covered + coverage.branches.covered,
          total: accumulator.branches.total + coverage.branches.total,
        },
        functions: {
          covered: accumulator.functions.covered + coverage.functions.covered,
          total: accumulator.functions.total + coverage.functions.total,
        },
        lines: {
          covered: accumulator.lines.covered + coverage.lines.covered,
          total: accumulator.lines.total + coverage.lines.total,
        },
      };
    },
    {
      statements: { covered: 0, total: 0 },
      branches: { covered: 0, total: 0 },
      functions: { covered: 0, total: 0 },
      lines: { covered: 0, total: 0 },
    },
  );
};

const formatPercentage = (value) => {
  return value.toFixed(2);
};

const evaluateThresholds = ({ label, percentages, thresholds }) => {
  const failures = Object.entries(thresholds).flatMap(([metric, minimum]) => {
    const actual = percentages[metric];
    if (actual >= minimum) {
      return [];
    }

    return [`${label}: ${metric} ${formatPercentage(actual)}% < ${minimum}%`];
  });

  return failures;
};

if (!existsSync(COVERAGE_FILE_PATH)) {
  console.error(
    `Coverage file not found: ${COVERAGE_FILE_PATH}. Run "yarn vitest run --coverage" first.`,
  );
  process.exit(1);
}

const coverageJson = JSON.parse(readFileSync(COVERAGE_FILE_PATH, 'utf8'));
const fileEntries = Object.entries(coverageJson);

if (fileEntries.length === 0) {
  console.error('Coverage file is empty.');
  process.exit(1);
}

const allFileMetrics = fileEntries.map(([, fileCoverage]) =>
  collectMetricsFromFileCoverage(fileCoverage),
);

const globalTotals = sumMetricTotals(allFileMetrics);
const globalPercentages = {
  statements: toPercentage(globalTotals.statements),
  branches: toPercentage(globalTotals.branches),
  functions: toPercentage(globalTotals.functions),
  lines: toPercentage(globalTotals.lines),
};

const failures = [
  ...evaluateThresholds({
    label: 'global',
    percentages: globalPercentages,
    thresholds: GLOBAL_THRESHOLDS,
  }),
];

for (const criticalFile of CRITICAL_FILE_THRESHOLDS) {
  const matchedEntry = fileEntries.find(([absolutePath]) =>
    path.normalize(absolutePath).endsWith(criticalFile.suffix),
  );

  if (!matchedEntry) {
    failures.push(
      `missing coverage entry for required file suffix "${criticalFile.suffix}"`,
    );
    continue;
  }

  const [absolutePath, fileCoverage] = matchedEntry;
  const fileTotals = collectMetricsFromFileCoverage(fileCoverage);
  const filePercentages = {
    statements: toPercentage(fileTotals.statements),
    branches: toPercentage(fileTotals.branches),
    functions: toPercentage(fileTotals.functions),
    lines: toPercentage(fileTotals.lines),
  };

  failures.push(
    ...evaluateThresholds({
      label: absolutePath,
      percentages: filePercentages,
      thresholds: criticalFile.thresholds,
    }),
  );
}

if (failures.length > 0) {
  console.error('Coverage threshold check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Coverage threshold check passed.');
console.log(
  `- global statements=${formatPercentage(globalPercentages.statements)}% branches=${formatPercentage(globalPercentages.branches)}% functions=${formatPercentage(globalPercentages.functions)}% lines=${formatPercentage(globalPercentages.lines)}%`,
);
