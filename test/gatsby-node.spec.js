const { expect } = require('chai');
// eslint-disable-next-line camelcase
const { unstable_shouldOnCreateNode } = require('../gatsby-node');

describe('test unstable_shouldOnCreateNode', () => {
  it('fails when false', () => {
    expect(unstable_shouldOnCreateNode({ node: { base: 'test.json' } })).to.equal(false);
  });

  it('passes when true', () => {
    expect(unstable_shouldOnCreateNode({ node: { base: 'test.aml' } })).to.equal(true);
  });
});
