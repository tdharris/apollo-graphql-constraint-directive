const { ApolloServer, gql } = require("apollo-server");
const { SchemaDirectiveVisitor, makeExecutableSchema, mergeSchemas } = require("graphql-tools");
const { GraphQLScalarType, GraphQLNonNull } = require("graphql");
const ConstraintDirective = require("graphql-constraint-directive");
const { assert } = require("chai");

let user = {
 id: '1',
 name: 'Tyler' 
};

// The GraphQL schema
const typeDefs = gql`
  # directive @length(max: Int) on FIELD_DEFINITION | INPUT_FIELD_DEFINITION

  directive @constraint(
    # String constraints
    minLength: Int
    maxLength: Int
    startsWith: String
    endsWith: String
    notContains: String
    pattern: String
    format: String

    # Number constraints
    min: Int
    max: Int
    exclusiveMin: Int
    exclusiveMax: Int
    multipleOf: Int
  ) on INPUT_FIELD_DEFINITION

  # scalar ConstraintString
  scalar ConstraintNumber

  type User {
    id: ID!
    name: String
  }

  type Query {
    user: User
  }

  type Mutation {
    updateUser(data: UserCreateInput!): User!
  }

  input UserCreateInput {
    name: String! @constraint(minLength: 5)
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    user: () => {
      console.log("user Query resolving:", user);
      return user;
    }
  },
  Mutation: {
    updateUser: (obj, args, ctx, info) => {
      user.name = args.data.name;
      console.log("updateUser Mutation resolving:", user);
      return user;
    }
  }
};

// Schema Directives
// class LengthDirective extends SchemaDirectiveVisitor {
//   visitInputFieldDefinition(field) {
//   	this.wrapType(field);
//   }

//   visitFieldDefinition(field) {
//     this.wrapType(field);
//   }

//   // Replace field.type with a custom GraphQLScalarType that enforces the
//   // length restriction.
//   wrapType(field) {
//     if (field.type instanceof GraphQLNonNull && field.type.ofType instanceof GraphQLScalarType) {
//       field.type = new GraphQLNonNull(new LimitedLengthType(field.type.ofType, this.args.max));
//     } else if (field.type instanceof GraphQLScalarType) {
//       field.type = new LimitedLengthType(field.type, this.args.max);
//     } else {
//       throw new Error(`Not a scalar type: ${field.type}`);
//     }
//   }
// }

// class LimitedLengthType extends GraphQLScalarType {
//   constructor(type, maxLength) {
//     super({
//       name: `LengthAtMost${maxLength}`,

//       // For more information about GraphQLScalar type (de)serialization,
//       // see the graphql-js implementation:
//       // https://github.com/graphql/graphql-js/blob/31ae8a8e8312/src/type/definition.js#L425-L446

//       serialize(value) {
//         value = type.serialize(value);
//         console.log("LimitedLengthType", value, value.length);
//         assert.isAtMost(value.length, maxLength);
//         return value;
//       },

//       parseValue(value) {
//         return type.parseValue(value);
//       },

//       parseLiteral(ast) {
//         return type.parseLiteral(ast);
//       }
//     });
//   }
// }

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: {
    // length: LengthDirective,
    constraint: ConstraintDirective
  }
});

// Workaround - bringing scalars separate and merging later 
// Note: Just ConstraintString is problem in this example
const scalarTypes = gql`
  scalar ConstraintString
  scalar ConstraintNumber
`;
const scalars = makeExecutableSchema({
  typeDefs: scalarTypes
});
const finalSchema = mergeSchemas({ schemas: [scalars, schema] });

const server = new ApolloServer({
  schema: finalSchema,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
