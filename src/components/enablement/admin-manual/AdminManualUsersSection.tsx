import {
  UsersAdminLevels,
  UsersRoleArchitecture,
  UsersRoleManagement,
  UsersPermissionGroups,
  UsersGranularPermissions,
  UsersAccountManagement,
  UsersAccessRequest,
  UsersAutoApproval
} from './sections/users';

export function AdminManualUsersSection() {
  return (
    <div className="space-y-8">
      <div id="admin-sec-3-1" data-manual-anchor="admin-sec-3-1">
        <UsersAdminLevels />
      </div>
      <div id="admin-sec-3-2" data-manual-anchor="admin-sec-3-2">
        <UsersRoleArchitecture />
      </div>
      <div id="admin-sec-3-3" data-manual-anchor="admin-sec-3-3">
        <UsersRoleManagement />
      </div>
      <div id="admin-sec-3-4" data-manual-anchor="admin-sec-3-4">
        <UsersPermissionGroups />
      </div>
      <div id="admin-sec-3-5" data-manual-anchor="admin-sec-3-5">
        <UsersGranularPermissions />
      </div>
      <div id="admin-sec-3-6" data-manual-anchor="admin-sec-3-6">
        <UsersAccountManagement />
      </div>
      <div id="admin-sec-3-7" data-manual-anchor="admin-sec-3-7">
        <UsersAccessRequest />
      </div>
      <div id="admin-sec-3-8" data-manual-anchor="admin-sec-3-8">
        <UsersAutoApproval />
      </div>
    </div>
  );
}
