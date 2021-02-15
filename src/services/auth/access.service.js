const log = require('consola');
const { Error: E } = require('mongoose');

const { ERRORS } = require('../../config');
const auth = require('../../middleware/jwt');

const User = require('../../models/user.model');
const Role = require('../../models/role.model');
const Permission = require('../../models/permission.model');
const express = require('express');

module.exports = {
  name: 'access',
  routes: {
    // permission routes
    'GET /access/permission': 'listPermissions',
    'GET /access/permission/:id': 'getPermission',
    'POST /access/permission': 'createPermission',
    'PUT /access/permission/:id': 'updatePermission',
    'DELETE /access/permission/:id': 'deletePermission',
    // role routes
    'GET /access/role': 'listRoles',
    'GET /access/role/:id': 'getRole',
    'POST /access/role': 'createRole',
    'PUT /access/role/:id': 'updateRole',
    'DELETE /access/role/:id': 'deleteRole',
    // assignment routes
    'POST /access/role/:roleId/permission/:permissionId': 'assignPermissionToRole',
    'DELETE /access/role/:roleId/permission/:permissionId': 'removePermissionFromRole',
    'POST /access/user/:userId/role/:roleId': 'assignRoleToUser',
    'DELETE /access/user/:userId/role/:roleId': 'removeRoleFromUser',
  },
  actions: {
    listPermissions: {
      middleware: [
        express.json(),
        auth({ required: true, permissions: ['3pixel.access.permission.read'] }),
      ],
      params: {
        module: { type: 'string', min: 1, optional: true },
        $$strict: true,
      },
      async handler({ res, params }) {
        let permissions;
        try {
          permissions = await this.listAllPermissions(params);
        } catch (err) {
          if (err instanceof E.CastError) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }
        res.send(permissions);
      },
    },
    getPermission: {
      middleware: [
        express.json(),
        auth({ required: true, permissions: ['3pixel.access.permission.read'] }),
      ],
      params: {
        id: 'string',
        $$strict: true,
      },
      async handler({ res, params }) {
        let permission;
        try {
          permission = await this.getPermissionById(params);
        } catch (err) {
          if (err instanceof E.CastError) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        if (!permission) {
          return res.status(404).send(ERRORS.NOT_FOUND);
        }

        res.send(permission);
      },
    },
    createPermission: {
      middleware: [
        express.json(),
        auth({ required: true, permissions: ['3pixel.access.permission.write'] }),
      ],
      params: {
        module: { type: 'string', min: 3, max: 128 },
        capability: { type: 'string', min: 3, max: 128 },
        $$strict: true,
      },
      async handler({ res, params }) {
        let permission;
        try {
          permission = new Permission(params);

          await permission.save();
        } catch (err) {
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        return res.status(201).send(permission);
      },
    },
    deletePermission: {
      middleware: [
        express.json(),
        auth({ required: true, permissions: ['3pixel.access.permission.write'] }),
      ],
      params: {
        id: 'string',
        $$strict: true,
      },
      async handler({ req, res, params }) {
        let permission;
        try {
          permission = await this.getPermissionById(params);
          if (!permission) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
        } catch (err) {
          if (err instanceof E.CastError) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        try {
          await Permission.findByIdAndDelete(permission._id).exec();
        } catch (err) {
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        res.status(204).end();
      },
    },
    updatePermission: {
      middleware: [
        express.json(),
        auth({ required: true, permissions: ['3pixel.access.permission.write'] }),
      ],
      params: {
        id: 'string',
        module: { type: 'string', min: 3, max: 128 },
        capability: { type: 'string', min: 3, max: 128 },
        $$strict: true,
      },
      async handler({ req, res, params }) {
        let permission;
        try {
          permission = await this.getPermissionById(params);
          if (!permission) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
        } catch (err) {
          if (err instanceof E.CastError) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        permission.module = params.module;
        permission.capability = params.capability;

        try {
          await permission.save();
        } catch (err) {
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        res.send(permission);
      },
    },
    listRoles: {
      middleware: [
        express.json(),
        auth({ required: true, permissions: ['3pixel.access.role.read'] }),
      ],
      params: {
        module: { type: 'string', min: 1, optional: true },
        $$strict: true,
      },
      async handler({ res, params }) {
        let roles;
        try {
          roles = await this.listAllRoles();
        } catch (err) {
          if (err instanceof E.CastError) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }
        res.send(roles);
      },
    },
    getRole: {
      middleware: [
        express.json(),
        auth({ required: true, permissions: ['3pixel.access.role.read'] }),
      ],
      params: {
        id: 'string',
        $$strict: true,
      },
      async handler({ res, params }) {
        let role;
        try {
          role = await this.getRoleById(params);
        } catch (err) {
          if (err instanceof E.CastError) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        if (!role) {
          return res.status(404).send(ERRORS.NOT_FOUND);
        }

        res.send(role);
      },
    },
    createRole: {
      middleware: [
        express.json(),
        auth({ required: true, permissions: ['3pixel.access.role.write'] }),
      ],
      params: {
        name: { type: 'string', min: 3, max: 128 },
        permissions: { type: 'array', items: { type: 'string', length: 24 }, optional: true },
        $$strict: true,
      },
      async handler({ res, params }) {
        let role;
        try {
          role = new Role(params);

          await role.save();
        } catch (err) {
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        return res.status(201).send(role);
      },
    },
    deleteRole: {
      middleware: [express.json(), auth({ required: true, permissions: ['3pixel.news.write'] })],
      params: {
        id: 'string',
        $$strict: true,
      },
      async handler({ res, params }) {
        let role;
        try {
          role = await this.getRoleById(params);
          if (!role) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
        } catch (err) {
          if (err instanceof E.CastError) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        try {
          await Role.findByIdAndDelete(role._id).exec();
        } catch (err) {
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        res.status(204).end();
      },
    },
    updateRole: {
      middleware: [
        express.json(),
        auth({ required: true, permissions: ['3pixel.access.role.write'] }),
      ],
      params: {
        id: 'string',
        name: { type: 'string', min: 3, max: 128 },
        permissions: { type: 'array', items: { type: 'string', length: 24 } },
        $$strict: true,
      },
      async handler({ req, res, params }) {
        let role;
        try {
          role = await this.getRoleById(params);
          if (!role) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
        } catch (err) {
          if (err instanceof E.CastError) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        role.name = params.name;
        role.permissions = params.permissions;

        try {
          await role.save();
        } catch (err) {
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        res.send(role);
      },
    },
    assignPermissionToRole: {
      middleware: [
        express.json(),
        auth({ required: true, permissions: ['3pixel.access.permission.assign'] }),
      ],
      params: {
        permissionId: { type: 'string', length: 24 },
        roleId: { type: 'string', length: 24 },
        $$strict: true,
      },
      async handler({ res, params }) {
        const { roleId, permissionId } = params;

        let role;
        let permission;
        try {
          role = await this.getRoleById({ id: roleId });
          permission = await this.getPermissionById({ id: permissionId });
          if (!role || !permission) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
        } catch (err) {
          if (err instanceof E.CastError) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        if (!role.permissions.includes(permissionId)) {
          role.permissions.push(permissionId);
        }

        try {
          await role.save();
        } catch (err) {
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        return res.status(204).end();
      },
    },
    removePermissionFromRole: {
      middleware: [
        express.json(),
        auth({ required: true, permissions: ['3pixel.access.permission.assign'] }),
      ],
      params: {
        permissionId: { type: 'string', length: 24 },
        roleId: { type: 'string', length: 24 },
        $$strict: true,
      },
      async handler({ res, params }) {
        const { roleId, permissionId } = params;

        let role;
        let permission;
        try {
          role = await this.getRoleById({ id: roleId });
          permission = await this.getPermissionById({ id: permissionId });
          if (!role || !permission) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
        } catch (err) {
          if (err instanceof E.CastError) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        if (role.permissions.includes(permissionId)) {
          await Role.updateOne(
            { _id: role._id },
            { $pullAll: { permissions: [permissionId] } },
          ).exec();
        }

        return res.status(204).end();
      },
    },
    assignRoleToUser: {
      middleware: [
        express.json(),
        auth({ required: true, permissions: ['3pixel.access.role.assign'] }),
      ],
      params: {
        userId: { type: 'string', length: 24 },
        roleId: { type: 'string', length: 24 },
        $$strict: true,
      },
      async handler({ res, params }) {
        const { userId, roleId } = params;

        let user;
        let role;
        try {
          role = await this.getRoleById({ id: roleId });
          user = await this.getUserById({ id: userId });
          if (!role || !user) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
        } catch (err) {
          if (err instanceof E.CastError) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        if (!user.roles.includes(roleId)) {
          user.roles.push(roleId);
        }

        try {
          await user.save();
        } catch (err) {
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        return res.status(204).end();
      },
    },
    removeRoleFromUser: {
      middleware: [
        express.json(),
        auth({ required: true, permissions: ['3pixel.access.role.assign'] }),
      ],
      params: {
        userId: { type: 'string', length: 24 },
        roleId: { type: 'string', length: 24 },
        $$strict: true,
      },
      async handler({ res, params }) {
        const { roleId, userId } = params;

        let role;
        let user;
        try {
          role = await this.getRoleById({ id: roleId });
          user = await this.getUserById({ id: userId });
          if (!role || !user) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
        } catch (err) {
          if (err instanceof E.CastError) {
            return res.status(404).send(ERRORS.NOT_FOUND);
          }
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        if (user.roles.includes(roleId)) {
          await User.updateOne({ _id: user._id }, { $pullAll: { roles: [roleId] } }).exec();
        }

        return res.status(204).end();
      },
    },
  },

  methods: {
    listAllPermissions({ module }) {
      const filter = {};
      if (module) filter.module = module;

      return Permission.find(filter).sort('module').exec();
    },
    getPermissionById({ id }) {
      return Permission.findById(id).exec();
    },
    listAllRoles() {
      return Role.find({}).sort('name').exec();
    },
    getRoleById({ id }) {
      return Role.findById(id).exec();
    },
    getUserById({ id }) {
      return User.findById(id).exec();
    },
  },
};
