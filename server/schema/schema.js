const Project = require('../models/Project');
const Client = require('../models/Client');
const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} = require('graphql');

const ProjectType = new GraphQLObjectType({
  name: 'Project',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    client: {
      type: ClientType,
      resolve(parentValue, args) {
        return Client.findById(parentValue.clientId);
      }
    }
  })
});

const ClientType = new GraphQLObjectType({
  name: 'Client',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString }
  })
});

const query = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    clients: {
      type: new GraphQLList(ClientType),
      resolve() {
        return Client.find();
      }
    },
    client: {
      type: ClientType,
      args: { id: { type: GraphQLID } },
      resolve(parentValue, { id }) {
        return Client.findById(id);
      }
    },
    projects: {
      type: new GraphQLList(ProjectType),
      resolve() {
        return Project.find();
      }
    },
    project: {
      type: ProjectType,
      args: { id: { type: GraphQLID } },
      resolve(parentValue, { id }) {
        return Project.findById(id);
      }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addClient: {
      type: ClientType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        phone: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, { name, email, phone }) {
        const client = new Client({ name, email, phone });
        return client.save();
      }
    },
    deleteClient: {
      type: ClientType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve(parentValue, { id }) {
        return Client.findOneAndRemove(id);
      }
    },
    addProject: {
      type: ProjectType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLNonNull(GraphQLString) },
        status: {
          type: new GraphQLEnumType({
            name: 'ProjectStatusAdd',
            values: {
              new: { value: 'Not Started' },
              progress: { value: 'In Progress' },
              completed: { value: 'Completed' }
            }
          }),
          defaultValue: 'Not Started'
        },
        clientId: { type: GraphQLNonNull(GraphQLID) }
      },
      resolve(parentValue, { name, description, status, clientId }) {
        const project = new Project({ name, description, status, clientId });
        return project.save();
      }
    },
    deleteProject: {
      type: ProjectType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve(parentValue, { id }) {
        return Project.findOneAndRemove(id);
      }
    },
    updateProject: {
      type: ProjectType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: {
          type: new GraphQLEnumType({
            name: 'ProjectStatusUpdate',
            values: {
              new: { value: 'Not Started' },
              progress: { value: 'In Progress' },
              completed: { value: 'Completed' }
            }
          }),
          defaultValue: 'Not Started'
        }
      },
      resolve(parent, { id, name, description, status }) {
        return Project.findByIdAndUpdate(
          id,
          {
            $set: {
              name,
              description,
              status
            }
          },
          { new: true }
        );
      }
    }
  }
});

module.exports = new GraphQLSchema({ query, mutation });
