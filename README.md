# gatsby-transformer-archieml-markdown

Parses ArchieML files into gatsby, with an option to parse markdown strings within the ArchieML.

## Install

`npm install gatsby-transformer-archieml-markdown`

You also need to have `gatsby-source-filesystem` installed and configured so it points to your files.

## How to use

In your `gatsby-config.js`:

```javascript
module.exports = {
  plugins: [
    `gatsby-transformer-archieml-markdown`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `./src/data/`,
      },
    },
  ],
}
```

## Parsing algorithm

Because of the way that gatsby requires a common schema for each type, this conflicts with ArchieML's freeform structure. To get around this, gatsby-transformer-archieml-markdown serializes the ArchieML object into a string. This behavior can be disabled if needed.

## How to query

You can query your archieML files like:

```graphql
{
  allDataArchieMl {
    edges {
      node {
        object
      }
    }
  }
}
```

Which would return:

```javascript
{
  allLettersJson: {
    edges: [
      {
        node: {
          object: "{\"object\":\"test\"}",
        },
      },
      {
        node: {
          object: "{\"object\":\"test\"}",
        },
      },
    ]
  }
}
```

## Configuration options

**`typeName`** [string|function][optional]

The default naming convention documented above can be changed with either a static string value (e.g. to be able to query all archieml files with a simple query):

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-archieml-markdown`,
      options: {
        typeName: `ArchieML`, // a fixed string
      },
    },
  ],
}
```

```graphql
{
  allArchieMl {
    edges {
      node {
        object
      }
    }
  }
}
```

or a function that receives the following arguments:

- `node`: the graphql node that is being processed, e.g. a File node with ArchieML content
- `object`: the parsed ArchieML object

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-archieml-markdown`,
      options: {
        typeName: ({ node, object }) => object.level,
      },
    },
  ],
}
```
