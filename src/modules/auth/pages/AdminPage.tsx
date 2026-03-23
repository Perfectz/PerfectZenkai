import { useEffect, useState } from 'react'
import { Shield, Users, RefreshCcw, KeyRound, Database, UserCog } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { useAuthStore } from '../store/authStore'
import { localAuthService } from '../services/localAuth'
import type { AuthRole } from '../types/auth'
import ModuleRegistryDiagnosticsPanel from '@/app/module-system/ModuleRegistryDiagnosticsPanel'

type AdminUserRecord = ReturnType<typeof localAuthService.listUsers>[number]

const roleOptions: AuthRole[] = ['user', 'admin']

export default function AdminPage() {
  const { user } = useAuthStore()
  const [users, setUsers] = useState<AdminUserRecord[]>([])
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<string>('')
  const bootstrapAdmin = localAuthService.getBootstrapAdminCredentials()

  const refreshUsers = () => {
    setUsers(localAuthService.listUsers())
  }

  useEffect(() => {
    refreshUsers()
  }, [])

  const handleRoleChange = async (userId: string, role: AuthRole) => {
    const updatedUser = await localAuthService.updateUserRole(userId, role)
    if (updatedUser.id === user?.id) {
      useAuthStore.setState({ user: updatedUser })
    }
    refreshUsers()
    setStatus(`Updated role for ${updatedUser.username || updatedUser.name} to ${role}.`)
  }

  const handlePasswordReset = async (userId: string) => {
    const password = passwordDrafts[userId]?.trim()
    if (!password) {
      setStatus('Enter a password before resetting a user credential.')
      return
    }

    await localAuthService.resetPassword(userId, password)
    setPasswordDrafts((current) => ({ ...current, [userId]: '' }))
    setStatus('Local password updated successfully.')
  }

  const adminCount = users.filter((entry) => entry.role === 'admin').length

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
            <Shield className="h-8 w-8 text-amber-400" />
            Admin Preview
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-300">
            Revival-mode admin controls for local evaluation. This is intentionally local-first so you can inspect the product before rebuilding the Supabase security model.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={refreshUsers}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh Local Users
        </Button>
      </div>

      {status && (
        <Card className="border-amber-400/30 bg-amber-500/10 text-amber-100">
          <CardContent className="p-4 text-sm">{status}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-gray-700 bg-gray-900/80 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-ki-green" />
              Local Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{users.length}</CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-900/80 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCog className="h-5 w-5 text-amber-400" />
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{adminCount}</CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-900/80 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-blue-400" />
              Active Provider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user?.authProvider || 'local'}</div>
            <p className="mt-1 text-sm text-gray-400">Current session role: {user?.role || 'user'}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-400/30 bg-gray-900/80 text-white">
        <CardHeader>
          <CardTitle>Bootstrap Admin</CardTitle>
          <CardDescription>
            This account is seeded automatically for local revival mode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 font-mono text-sm text-amber-100">
          <div>username: {bootstrapAdmin.username}</div>
          <div>password: {bootstrapAdmin.password}</div>
          <div>role: {bootstrapAdmin.role}</div>
        </CardContent>
      </Card>

      <Card className="border-gray-700 bg-gray-900/80 text-white">
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>
            Update local account roles and reset local passwords. This is the preview surface you can later back with a real admin policy model in Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {users.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-gray-700 bg-black/20 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-lg font-semibold text-white">{entry.name || entry.username}</div>
                  <div className="text-sm text-gray-400">@{entry.username}</div>
                  <div className="text-sm text-gray-400">{entry.email || 'No email set'}</div>
                  <div className="mt-2 text-xs uppercase tracking-wide text-gray-500">
                    Created {new Date(entry.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]">
                  <div className="space-y-2">
                    <Label htmlFor={`role-${entry.id}`}>Role</Label>
                    <select
                      id={`role-${entry.id}`}
                      value={entry.role}
                      onChange={(event) => void handleRoleChange(entry.id, event.target.value as AuthRole)}
                      className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`password-${entry.id}`}>Reset Local Password</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`password-${entry.id}`}
                        type="text"
                        value={passwordDrafts[entry.id] || ''}
                        onChange={(event) =>
                          setPasswordDrafts((current) => ({
                            ...current,
                            [entry.id]: event.target.value,
                          }))
                        }
                        placeholder="new password"
                        className="border-gray-700 bg-gray-950 text-white"
                      />
                      <Button type="button" variant="outline" onClick={() => void handlePasswordReset(entry.id)}>
                        <KeyRound className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <ModuleRegistryDiagnosticsPanel />
    </div>
  )
}