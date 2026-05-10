import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Save, User, KeyRound, CheckCircle2, AlertCircle, Camera } from "lucide-react"

import { useMe, useUpdateUser, useChangePassword, useUploadAvatar } from "@/features/users/api/users.queries"
import { updateUserSchema, changePasswordSchema } from "@/features/users/types/users.types"
import type { UpdateUserDto, ChangePasswordDto } from "@/features/users/types/users.types"
import { cn } from "@/lib/utils"

interface ProfileModalProps {
  open: boolean
  onClose: () => void
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { data: me, isLoading: meLoading } = useMe()
  const updateUser = useUpdateUser()
  const changePassword = useChangePassword()
  const uploadAvatar = useUploadAvatar()

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form states for success messages
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Profile Form (excluding avatarUrl as per request)
  const profileForm = useForm<UpdateUserDto>({
    resolver: zodResolver(updateUserSchema),
    values: {
      login: me?.login || "",
      firstName: me?.firstName || "",
      lastName: me?.lastName || "",
    },
  })

  // Password Form
  const passwordForm = useForm<ChangePasswordDto>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  })

  const onProfileSubmit = (data: UpdateUserDto) => {
    if (!me) return
    setProfileSuccess(false)
    updateUser.mutate(
      { id: me.id, data },
      {
        onSuccess: () => {
          setProfileSuccess(true)
          setTimeout(() => setProfileSuccess(false), 3000)
        },
      }
    )
  }

  const onPasswordSubmit = (data: ChangePasswordDto) => {
    setPasswordSuccess(false)
    changePassword.mutate(data, {
      onSuccess: () => {
        setPasswordSuccess(true)
        passwordForm.reset()
        setTimeout(() => setPasswordSuccess(false), 3000)
      },
    })
  }

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 5MB (handled by backend but good to check on frontend too)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Max size is 5MB.")
      return
    }

    uploadAvatar.mutate(file, {
      onSuccess: () => {
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    })
  }

  const userInitials = me
    ? (`${me.firstName?.charAt(0) || ""}${me.lastName?.charAt(0) || ""}` || me.login?.charAt(0) || "?").toUpperCase()
    : "?"

  const resetState = () => {
    setProfileSuccess(false)
    setPasswordSuccess(false)
    profileForm.reset()
    passwordForm.reset()
  }

  const handleClose = () => {
    if (updateUser.isPending || changePassword.isPending) return
    onClose()
    setTimeout(resetState, 200) // Reset after animation
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent
        size="wide"
        className="max-w-[800px] w-full p-0 gap-0 overflow-hidden bg-[#181818] border border-white/[0.08] text-zinc-200 shadow-2xl shadow-black/50 rounded-2xl"
      >
        <DialogHeader className="p-6 pb-2 bg-[#181818]">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-white tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.1] shadow-inner">
              <User className="h-4 w-4 text-zinc-300" />
            </div>
            Profile Settings
          </DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>

        {meLoading ? (
          <div className="flex items-center justify-center h-[500px]">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
          </div>
        ) : (
          <div className="flex h-[550px] bg-[#181818]">
            {/* Left Column: Avatar & Quick Info */}
            <div className="w-[260px] border-r border-white/[0.04] p-6 flex flex-col items-center text-center relative overflow-hidden bg-white/[0.01]">
              <div 
                className="relative group mt-6 mb-4"
                onClick={() => !uploadAvatar.isPending && fileInputRef.current?.click()}
              >
                <Avatar className="h-28 w-28 ring-4 ring-[#181818] bg-zinc-800 shadow-xl">
                  {me?.avatarUrl && <AvatarImage src={me.avatarUrl} alt="Avatar" className="object-cover" />}
                  <AvatarFallback className="text-3xl font-medium text-zinc-300">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute inset-0 bg-black/60 rounded-full flex items-center justify-center transition-opacity border border-white/10",
                  uploadAvatar.isPending ? "opacity-100 cursor-not-allowed" : "opacity-0 group-hover:opacity-100 cursor-pointer"
                )}>
                  {uploadAvatar.isPending ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarFileChange} 
                  accept="image/jpeg,image/png,image/gif,image/webp" 
                  className="hidden" 
                />
              </div>
              
              <h3 className="text-lg font-medium text-white tracking-tight">{me?.firstName} {me?.lastName}</h3>
              <p className="text-sm text-zinc-500 mb-6 font-mono">@{me?.login}</p>
              
              {me?.email && (
                <div className="mt-auto w-full rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 text-left">
                  <p className="text-[11px] text-zinc-600 uppercase tracking-widest font-semibold mb-1.5">Email Address</p>
                  <p className="text-[13px] text-zinc-400 truncate">{me.email}</p>
                </div>
              )}
            </div>

            {/* Right Column: Forms */}
            <ScrollArea className="flex-1">
              <div className="p-8 space-y-10">
                {/* General Info Form */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-6 w-1 rounded-full bg-white/[0.2]" />
                    <h2 className="text-[15px] font-medium text-white">General Information</h2>
                  </div>
                  
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-[12px] font-medium text-zinc-500 uppercase tracking-wider">First Name</label>
                        <input
                          {...profileForm.register("firstName")}
                          className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.15] transition-all shadow-inner"
                        />
                        {profileForm.formState.errors.firstName && (
                          <p className="text-[11px] text-red-400">{profileForm.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[12px] font-medium text-zinc-500 uppercase tracking-wider">Last Name</label>
                        <input
                          {...profileForm.register("lastName")}
                          className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.15] transition-all shadow-inner"
                        />
                        {profileForm.formState.errors.lastName && (
                          <p className="text-[11px] text-red-400">{profileForm.formState.errors.lastName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-[12px] font-medium text-zinc-500 uppercase tracking-wider">Username</label>
                        <input
                          {...profileForm.register("login")}
                          className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.15] transition-all shadow-inner font-mono"
                        />
                        {profileForm.formState.errors.login && (
                          <p className="text-[11px] text-red-400">{profileForm.formState.errors.login.message}</p>
                        )}
                      </div>
                    </div>

                    {updateUser.isError && (
                      <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-[13px] text-red-400">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>Failed to update profile. Ensure the username is unique.</p>
                      </div>
                    )}

                    <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                      <span className={cn(
                        "text-[12px] text-emerald-400 flex items-center gap-1.5 transition-all duration-300 font-medium",
                        profileSuccess ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                      )}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Saved successfully
                      </span>
                      <button
                        type="submit"
                        disabled={updateUser.isPending}
                        className="h-9 px-6 text-[13px] font-medium bg-white/[0.08] text-zinc-200 border border-white/[0.05] hover:bg-white/[0.12] hover:text-white disabled:opacity-40 disabled:hover:bg-white/[0.08] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {updateUser.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                      </button>
                    </div>
                  </form>
                </section>

                <div className="h-px bg-white/[0.04] w-full" />

                {/* Security Form */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-6 w-1 rounded-full bg-white/[0.2]" />
                    <h2 className="text-[15px] font-medium text-white">Security & Password</h2>
                  </div>
                  
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                    <div className="grid gap-5">
                      <div className="space-y-2">
                        <label className="text-[12px] font-medium text-zinc-500 uppercase tracking-wider">Current Password</label>
                        <input
                          type="password"
                          {...passwordForm.register("oldPassword")}
                          className="w-full max-w-sm rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.15] transition-all shadow-inner font-mono"
                        />
                        {passwordForm.formState.errors.oldPassword && (
                          <p className="text-[11px] text-red-400">{passwordForm.formState.errors.oldPassword.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[12px] font-medium text-zinc-500 uppercase tracking-wider">New Password</label>
                        <input
                          type="password"
                          {...passwordForm.register("newPassword")}
                          className="w-full max-w-sm rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.15] transition-all shadow-inner font-mono"
                        />
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-[11px] text-red-400">{passwordForm.formState.errors.newPassword.message}</p>
                        )}
                      </div>
                    </div>

                    {changePassword.isError && (
                      <div className="mt-5 max-w-sm flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-[13px] text-red-400">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>Failed to change password. Please verify your current password.</p>
                      </div>
                    )}

                    <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                      <span className={cn(
                        "text-[12px] text-emerald-400 flex items-center gap-1.5 transition-all duration-300 font-medium",
                        passwordSuccess ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                      )}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Password updated
                      </span>
                      <button
                        type="submit"
                        disabled={changePassword.isPending}
                        className="h-9 px-6 text-[13px] font-medium bg-white/[0.08] text-zinc-200 border border-white/[0.05] hover:bg-white/[0.12] hover:text-white disabled:opacity-40 disabled:hover:bg-white/[0.08] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {changePassword.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4 text-zinc-400" />}
                        Update Password
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
