# apollo-graphql-constraint-directive

### Description:
This repo is just to demonstrate an issue. See the following:
- https://github.com/apollographql/apollo-server/issues/1303
- https://github.com/confuser/graphql-constraint-directive/issues/2

### Install:
```
git clone https://github.com/tdharris/apollo-graphql-constraint-directive.git
cd apollo-graphql-constraint-directive
npm install
```

### Expected Behavior:
`updateUser` Mutation resolves to change the name of a user. 
<br/>Directive should enforce the `@constraint(minLength: 5)` placed on the `UserCreateInput`

### Test (working):
1. `npm start`
2. Navigate in browser to `localhost:4000`
3. Send the following query:
```
query {
  user {
    name
  }
}
```
4. Send the following mutation:
```
mutation {
  updateUser(data:{
    name: "Bro"
  }) {
    id
    name
  }
}
```
Note: Works! The mutation is blocked because of the constraint.

### Test (broken):
1. Uncomment `l34: scalar ConstraintString` in the `typeDefs` graphql schema
2. Restart server: `Ctrl+C` > `npm start`
3. Send the same mutation:
```
mutation {
  updateUser(data:{
    name: "Bro"
  }) {
    id
    name
  }
}
```
Note: Mutation is permitted and the `@constraint(minLength: 5)` is ignored in the `UserCreateInput` !

Currently:
- Either directive works, but introspection doesn't.
- Or directive does not work, but introspection works.
