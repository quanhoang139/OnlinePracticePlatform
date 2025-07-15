import { Role } from "../models";

const getAllRoles = async () => {
    return await Role.findAll();
};

const getRoleById = async (roleId) => {
    return await Role.findByPk(roleId);
};

const createRole = async (roleData) => {
    return await Role.create(roleData);
};

const updateRole = async (roleId, roleData) => {
    const role = await Role.findByPk(roleId);
    if (!role) throw new Error("Role not found");
    await role.update(roleData);
    return role;
};

const deleteRole = async (roleId) => {
    const role = await Role.findByPk(roleId);
    if (!role) throw new Error("Role not found");
    await role.destroy();
    return { message: "Role deleted successfully" };
};

module.exports = {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
};
