"use client"
import React from "react"
import { useDashboard } from "../context/DashboardContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FolderGit, Plus, Lock, Copy, Download, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { formatNumberInput, parseNumberInput } from "@/lib/utils"

export default function ProjectsPage() {
  const {
    role,
    projects,
    isAddProjectOpen,
    setIsAddProjectOpen,
    newProjTitle,
    setNewProjTitle,
    newProjDesc,
    setNewProjDesc,
    newProjUrl,
    setNewProjUrl,
    newProjMinSupport,
    setNewProjMinSupport,
    handleAddProject,
    openEditProject,
    isEditProjectOpen,
    setIsEditProjectOpen,
    editProjTitle,
    setEditProjTitle,
    editProjDesc,
    setEditProjDesc,
    editProjUrl,
    setEditProjUrl,
    editProjMinSupport,
    setEditProjMinSupport,
    handleEditProject,
    confirmDelete,
    setConfirmDelete,
    handleDeleteProject
  } = useDashboard()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm dark:bg-[#121211] dark:border-zinc-800/80">
        <div>
          <h2 className="text-base font-black italic tracking-widest">Berbagi Proyek & Hadiah Digital</h2>
          <p className="text-sm font-bold text-slate-400 italic mt-0.5">
            Bagikan file proyek ZIP, desain Figma, atau wallpaper eksklusif dengan minimal donasi saldo.
          </p>
        </div>

        <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
          <DialogTrigger
            render={
              <Button className="bg-[#FFD551] text-black border border-slate-200 dark:border-zinc-800 hover:bg-[#FFC83B] text-xs font-black italic h-10 px-5 rounded-2xl shadow-sm transition-all active:scale-95">
                <Plus className="mr-2 h-4 w-4" /> Proyek Baru
              </Button>
            }
          />
          <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
            <DialogHeader className="space-y-1 text-center">
              <DialogTitle className="text-2xl font-black italic tracking-tighter flex items-center justify-center gap-2 text-black dark:text-white">
                <FolderGit className="h-6 w-6 text-[#FFD551]" /> Proyek Digital Baru
              </DialogTitle>
              <DialogDescription className="font-bold italic text-[9px] text-slate-400 tracking-widest">
                Bagikan Tautan Unduhan Reward Kreatif
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProject} className="space-y-4 pt-4 text-[#1A1A19] dark:text-white">
              <div className="space-y-2">
                <Label className="font-black italic text-xs text-slate-500">Judul Proyek Digital</Label>
                <Input 
                  required 
                  placeholder={role === "DEVELOPER" ? "Template Next.js Clean Boilerplate" : role === "DESIGNER" ? "3D Minimalist Vector Wallpaper Pack" : "Exclusive Guide & Setup MLBB"} 
                  value={newProjTitle} 
                  onChange={(e) => setNewProjTitle(e.target.value)}
                  className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black italic text-xs text-slate-500">Deskripsi Singkat Proyek</Label>
                <Input 
                  placeholder="Berikan detail apa yang akan didapatkan pendukung Anda" 
                  value={newProjDesc} 
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black italic text-xs text-slate-500">Tautan File Unduhan (Drive / GitHub / Figma)</Label>
                <Input 
                  required 
                  placeholder="https://drive.google.com/file/d/..." 
                  value={newProjUrl} 
                  onChange={(e) => setNewProjUrl(e.target.value)}
                  className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black italic text-xs text-slate-500">Minimal Dukungan Donasi Unlocking (Rp)</Label>
                <Input 
                  type="text" 
                  required 
                  placeholder="20.000" 
                  value={formatNumberInput(newProjMinSupport)} 
                  onChange={(e) => setNewProjMinSupport(String(parseNumberInput(e.target.value)))}
                  className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-2xl font-black italic text-xs transition-all shadow-md">
                  Terbitkan Proyek Digital
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-xs font-bold text-slate-400 italic dark:bg-[#121211] dark:border-zinc-800/80">
          Belum ada proyek digital yang dibagikan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((proj: any) => (
            <Card key={proj.id} className="border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-[#121211] dark:border-zinc-800/80 flex flex-col justify-between">
              <CardHeader className="bg-[#FAF9F6] border-b border-slate-100 p-5 flex flex-row justify-between items-start text-black dark:bg-[#1E1E1D]/55 dark:text-white dark:border-zinc-800">
                <div>
                  <CardTitle className="font-black italic text-xs tracking-wide">{proj.title}</CardTitle>
                  <CardDescription className="text-sm font-bold italic mt-1 text-slate-400">Unlocks on donation</CardDescription>
                </div>
                <FolderGit className="h-5 w-5 text-[#FFD551]" />
              </CardHeader>
              <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-[#EAE9E4]/70 mb-4">
                    {proj.description || "Dapatkan tautan akses file unduhan penuh dengan mendukung kreator."}
                  </p>

                  <div className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl p-3 mb-4 flex items-center justify-between dark:bg-zinc-900/60 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2 truncate">
                      <Lock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="text-xs font-mono truncate text-emerald-600 font-bold">{proj.file_url}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-slate-400 hover:text-black shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(proj.file_url)
                        toast.success("Tautan unduhan proyek berhasil disalin!")
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-black italic text-slate-400">Minimal Dukungan:</span>
                    <span className="text-sm font-black italic text-black dark:text-white">Rp {Number(proj.min_support).toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-[#F2F0EA] dark:border-zinc-800/60 pt-3.5">
                  <Button variant="outline" className="bg-emerald-50 text-emerald-600 border border-emerald-200/40 hover:bg-emerald-100 font-black italic text-xs flex-1 justify-center h-10 rounded-xl gap-1.5 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800">
                    <Download className="h-4 w-4" /> {proj.download_count} Unduhan
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => openEditProject(proj)}
                    className="h-10 w-10 border border-slate-200 rounded-xl hover:bg-blue-50 hover:text-blue-500 active:scale-95 transition-all text-slate-400 dark:border-zinc-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setConfirmDelete({type: 'project', id: proj.id, name: proj.title})}
                    className="h-10 w-10 border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-500 active:scale-95 transition-all text-slate-400 dark:border-zinc-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Project Modal */}
      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
          <DialogHeader className="space-y-1 text-center">
            <DialogTitle className="text-2xl font-black italic tracking-tighter flex items-center justify-center gap-2 text-black dark:text-white">
              Sunting Proyek Digital
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditProject} className="space-y-4 pt-4 text-[#1A1A19] dark:text-white">
            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500">Judul Proyek Digital</Label>
              <Input 
                required 
                value={editProjTitle} 
                onChange={(e) => setEditProjTitle(e.target.value)}
                className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500">Deskripsi Singkat Proyek</Label>
              <Input 
                value={editProjDesc} 
                onChange={(e) => setEditProjDesc(e.target.value)}
                className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500">Tautan File Unduhan (Drive / GitHub / Figma)</Label>
              <Input 
                required 
                value={editProjUrl} 
                onChange={(e) => setEditProjUrl(e.target.value)}
                className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black italic text-xs text-slate-500">Minimal Dukungan Donasi Unlocking (Rp)</Label>
              <Input 
                type="text" 
                required 
                value={formatNumberInput(editProjMinSupport)} 
                onChange={(e) => setEditProjMinSupport(String(parseNumberInput(e.target.value)))}
                className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white font-bold"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-2xl font-black italic text-xs transition-all shadow-md">
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      {confirmDelete && confirmDelete.type === 'project' && (
        <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl font-black italic text-red-500">Hapus Proyek Digital?</DialogTitle>
              <DialogDescription className="text-xs font-bold text-slate-400 mt-2">
                Tindakan ini akan menonaktifkan dan menghapus proyek digital "{confirmDelete.name}" secara permanen dari sistem.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4 flex gap-2">
              <Button onClick={() => setConfirmDelete(null)} variant="outline" className="flex-1 rounded-xl h-11">
                Batal
              </Button>
              <Button onClick={() => { handleDeleteProject(confirmDelete.id); setConfirmDelete(null) }} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 border-none font-black italic">
                Hapus Proyek
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
