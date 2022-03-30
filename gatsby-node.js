const archieml = require('archieml');
const path = require('path');
const marked = require('marked');

/**
 * ArchieML & Markdown Transformer for Gatsby
 *
 * This plugin allows gatsby to use ArchieML files as a content source,
 * allowing content to be much more easily specified and written in
 * content documents.
 *
 * Options:
 *  - typeName (func|string, default: "ArchieML"): The default naming
 *    convention can be changed to a custom function.
 *  - serialized (bool, default: true): Because of the way that gatsby
 *    processes nodes, it assumes the schema to be the same between all
 *    entries of this type, therefore making ArchieML's flexibility moot.
 *    Thus, we serialize by default in order to prevent this.
 *  - gatsbyKey (string, default: "object"): The key that is used for querying
 *    in gatsby.
 *  - filenameRegex (regex, default: /\.aml$/): a regex that determines the
 *    files that will get read as archieML nodes.
 *  - markdownKeyRegex (regex, default: /markdown/):
 *  - markdownOptions (object, default: {}): Uses marked for parsing markdown
 *    under the hood, so accepts an object of marked configuration options.
 */

/**
 * unstable_shouldOnCreateNode determines whether a node should be created
 * for this node.
 *
 * @param node
 * @param options
 * @returns {boolean}
 */
// eslint-disable-next-line camelcase
function unstable_shouldOnCreateNode({ node }, options) {
  const { filenameRegex } = options || {};
  return (filenameRegex || /\.aml$/).test(node.base);
}

/**
 * Recursively processes an object, handling any values that should get parsed
 * from markdown into HTML.
 *
 * @param obj
 * @param markdownKeyRegex
 * @param markdownOptions
 * @returns {*}
 */
function handleMarkdown(obj, markdownKeyRegex, markdownOptions) {
  Object.keys(obj).forEach((key) => {
    // If the key matches the regex
    if ((markdownKeyRegex || /markdown/).test(key)) {
      // If it is a string, we simply parse it as markdown
      if (typeof obj[key] === 'string') {
        // eslint-disable-next-line no-param-reassign
        obj[key] = marked.parse(obj[key], { ...markdownOptions });
      }

      // If it is an array, it could be a freeform array in which we have to
      // check the types and values.
      if (Array.isArray(obj[key])) {
        obj[key].forEach((entry, index) => {
          if (entry.type && (entry.type === 'text' || (markdownKeyRegex || /markdown/).test(entry.type))) {
            // eslint-disable-next-line no-param-reassign
            obj[key][index].value = marked.parse(entry.value, { ...markdownOptions });
          }
        });
      }
    }

    // If the value is an object we recurse
    if (typeof obj[key] === 'object') {
      // eslint-disable-next-line no-param-reassign
      obj[key] = handleMarkdown(obj[key], markdownKeyRegex, markdownOptions);
    }
  });

  // Return the object
  return obj;
}

/**
 * Creates the node for ArchieML types.
 *
 * @param node
 * @param actions
 * @param loadNodeContent
 * @param createNodeId
 * @param createContentDigest
 * @param typeName
 * @param filenameRegex
 * @param gatsbyKey
 * @param serialized
 * @param markdownKeyRegex
 * @param markdownOptions
 * @returns {Promise<void>}
 */
async function onCreateNode(
  {
    node,
    actions,
    loadNodeContent,
    createNodeId,
    createContentDigest,
  },
  {
    typeName,
    filenameRegex,
    gatsbyKey = 'object',
    serialized = true,
    markdownKeyRegex,
    markdownOptions,
  },
) {
  // If this node doesn't fulfill the criteria for creating an ArchieML node,
  // simply return.
  if (!unstable_shouldOnCreateNode(
    { node }, { filenameRegex },
  )) return;

  // Load the content into an ArchieML object and handle any markdown parsing.
  const object = handleMarkdown(
    archieml.load(await loadNodeContent(node)),
    markdownKeyRegex,
    markdownOptions,
  );

  // Generate the right type
  let type = `${path.basename(node.dir)}ArchieML`;
  if (typeof typeName === 'function') {
    type = typeName({ node, object });
  } else if (typeof typeName === 'string') {
    type = typeName;
  }

  // Generate the output object for Gatsby
  const output = {
    [gatsbyKey]: serialized ? JSON.stringify(object) : object,
    id: createNodeId(`${node.id} >>> ArchieML`),
    internal: {
      contentDigest: createContentDigest(serialized ? JSON.stringify(object) : object),
      type,
    },
  };

  // Call the create actions
  actions.createNode(output);
  actions.createParentChildLink({ parent: node, child: output });
}

// eslint-disable-next-line camelcase
exports.unstable_shouldOnCreateNode = unstable_shouldOnCreateNode;
exports.onCreateNode = onCreateNode;
