/**
 * Rollup configuration for dual ESM/CJS builds.
 */
export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/cjs/wallet.js',
      format: 'cjs',
      exports: 'named',
    },
    external: ['@noble/hashes/sha2.js', '@noble/hashes/sha3', '@noble/hashes/utils', '@noble/hashes/utils.js', '@theqrl/mldsa87', 'randombytes'],
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/mjs/wallet.js',
      format: 'esm',
    },
    external: ['@noble/hashes/sha2.js', '@noble/hashes/sha3', '@noble/hashes/utils', '@noble/hashes/utils.js', '@theqrl/mldsa87', 'randombytes'],
  },
];
