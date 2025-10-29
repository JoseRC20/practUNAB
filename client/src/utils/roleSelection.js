const roles = {
  0: 'student',
  1: 'professor',
  2: 'secretary'
};

//Handles role selection based on the provided role ID.
function handleRoleSelection(roleId) {
  if (roles.hasOwnProperty(roleId)) {
    return `Rol seleccionado: ${roles[roleId]}`;
  } else {
    return 'Rol no válido';
  }
}

export { handleRoleSelection, roles };