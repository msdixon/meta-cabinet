export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const LandingPartsFragmentDoc = gql`
    fragment LandingParts on Landing {
  __typename
  mastheadKicker
  mastheadLocation
  mastheadMaintainedBy
  mastheadMaintainerUrl
  mastheadGithubUrl
  mastheadEst
  ledeAttribution {
    __typename
    prefix
    linkText
    linkUrl
    suffix
  }
  context {
    __typename
    whatThisIsHeading
    whatThisIs
    collaborationHeading
    collaboration
    aiQuestionHeading
    aiQuestion
  }
  practiceGrid {
    __typename
    heading
    body
  }
  footerSig
  footerLinks {
    __typename
    label
    url
  }
}
    `;
export const RoomsPartsFragmentDoc = gql`
    fragment RoomsParts on Rooms {
  __typename
  order
  index
  titleMain
  titleSuffix
  tag
  sub
  metaLine1
  metaLine2
  githubUrl
  anchor
  rosterSections {
    __typename
    label
    members {
      __typename
      name
      role
    }
  }
  body
}
    `;
export const TranscriptPartsFragmentDoc = gql`
    fragment TranscriptParts on Transcript {
  __typename
  sectionTitle
  sectionNote
  headerLabel
  source
  prompt
  entries {
    __typename
    speaker
    text
  }
  note
}
    `;
export const LandingDocument = gql`
    query landing($relativePath: String!) {
  landing(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...LandingParts
  }
}
    ${LandingPartsFragmentDoc}`;
export const LandingConnectionDocument = gql`
    query landingConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: LandingFilter) {
  landingConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...LandingParts
      }
    }
  }
}
    ${LandingPartsFragmentDoc}`;
export const RoomsDocument = gql`
    query rooms($relativePath: String!) {
  rooms(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...RoomsParts
  }
}
    ${RoomsPartsFragmentDoc}`;
export const RoomsConnectionDocument = gql`
    query roomsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: RoomsFilter) {
  roomsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...RoomsParts
      }
    }
  }
}
    ${RoomsPartsFragmentDoc}`;
export const TranscriptDocument = gql`
    query transcript($relativePath: String!) {
  transcript(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...TranscriptParts
  }
}
    ${TranscriptPartsFragmentDoc}`;
export const TranscriptConnectionDocument = gql`
    query transcriptConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: TranscriptFilter) {
  transcriptConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...TranscriptParts
      }
    }
  }
}
    ${TranscriptPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    landing(variables, options) {
      return requester(LandingDocument, variables, options);
    },
    landingConnection(variables, options) {
      return requester(LandingConnectionDocument, variables, options);
    },
    rooms(variables, options) {
      return requester(RoomsDocument, variables, options);
    },
    roomsConnection(variables, options) {
      return requester(RoomsConnectionDocument, variables, options);
    },
    transcript(variables, options) {
      return requester(TranscriptDocument, variables, options);
    },
    transcriptConnection(variables, options) {
      return requester(TranscriptConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "http://localhost:4001/graphql",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
