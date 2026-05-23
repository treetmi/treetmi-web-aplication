"use client"
import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  ShieldAlert, 
  Search, 
  Plus, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Lock
} from "lucide-react"
import { toast } from "sonner"
import { fetchWithRetry, API_BASE_URL } from "@/lib/api"

interface FilterWord {
  id: string
  word: string
  type: string
  createdAt: string
}

export default function CreatorFilterWordsPage() {
  const { data: session } = useSession()
  const [customWords, setCustomWords] = useState<FilterWord[]>([])
  const [globalWords, setGlobalWords] = useState<FilterWord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL")
  const [activeTab, setActiveTab] = useState<"custom" | "global">("custom")
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Add new word form states
  const [newWord, setNewWord] = useState("")
  const [newType, setNewType] = useState("PROFANITY")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch words
  const fetchFilterWords = async () => {
    if (!session?.user?.accessToken) return
    setLoading(true)
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/users/filter-words`, {
        headers: {
          "Authorization": `Bearer ${session.user.accessToken}`
        }
      })
      const json = await res.json()
      if (json.success) {
        setCustomWords(json.data?.custom || [])
        setGlobalWords(json.data?.global || [])
      } else {
        toast.error(json.message || "Gagal mengambil data kata sensor.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Terjadi kesalahan koneksi.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFilterWords()
  }, [session])

  // Add word handler
  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWord.trim()) {
      toast.error("Kata sensor tidak boleh kosong!")
      return
    }
    if (!session?.user?.accessToken) return
    setIsSubmitting(true)

    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/users/filter-words`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({
          word: newWord.trim(),
          type: newType
        })
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message || "Kata sensor berhasil ditambahkan.")
        setNewWord("")
        setIsAddDialogOpen(false)
        fetchFilterWords()
      } else {
        toast.error(json.message || "Gagal menambahkan kata sensor.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal terhubung ke server.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete word handler
  const handleDeleteWord = async (id: string, word: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kata sensor kustom "${word}"?`)) return
    if (!session?.user?.accessToken) return

    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/users/filter-words/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.user.accessToken}`
        }
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message || "Kata sensor kustom berhasil dihapus.")
        fetchFilterWords()
      } else {
        toast.error(json.message || "Gagal menghapus kata sensor.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal terhubung ke server.")
    }
  }

  // Filter & Search Logic
  const currentWordsList = activeTab === "custom" ? customWords : globalWords

  const filteredWords = currentWordsList.filter(item => {
    const matchesSearch = item.word.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedTypeFilter === "ALL" || item.type === selectedTypeFilter
    return matchesSearch && matchesType
  })

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredWords.length / itemsPerPage))
  const paginatedWords = filteredWords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset page on filter or tab change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedTypeFilter, activeTab])

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm dark:bg-[#121211] dark:border-zinc-800/80">
        <div>
          <h2 className="text-sm md:text-base font-black italic tracking-widest flex items-center gap-2 text-black dark:text-[#FFD551]">
            <ShieldAlert className="h-5 w-5" /> Sensor Kata Kustom Kreator
          </h2>
          <p className="text-[11px] md:text-xs font-bold text-slate-400 italic mt-1">
            {activeTab === "custom" 
              ? "Tambahkan kata-kata terlarang kustom yang khusus berlaku di halaman profil dan overlay Anda sendiri."
              : "Daftar kata sensor global yang dikelola oleh superadmin. Berlaku otomatis untuk semua kreator di platform."}
          </p>
        </div>

        {activeTab === "custom" && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger
              render={
                <Button className="bg-[#FFD551] text-black border border-slate-200 dark:border-zinc-800 hover:bg-[#FFC83B] text-xs md:text-sm font-black italic h-10 px-5 rounded-2xl shadow-sm transition-all active:scale-95">
                  <Plus className="mr-2 h-4 w-4" /> Tambah Kata Sensor
                </Button>
              }
            />
            <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
              <DialogHeader className="space-y-1 text-center">
                <DialogTitle className="text-2xl font-black italic tracking-tighter flex items-center justify-center gap-2 text-black dark:text-white">
                  Tambah Kata Sensor Baru
                </DialogTitle>
                <DialogDescription className="font-bold italic text-[11px] md:text-xs text-slate-400 tracking-widest">
                  TAMBAH SENSOR KHUSUS AKUN ANDA
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddWord} className="space-y-4 pt-4 text-[#1A1A19] dark:text-white">
                <div className="space-y-2">
                  <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400">Kata / Frasa Terlarang</Label>
                  <Input
                    required
                    placeholder="Contoh: judi, spam, kata kasar"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    className="h-11 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white text-xs md:text-sm font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-black italic text-xs md:text-sm text-slate-500 dark:text-zinc-400">Kategori Pelanggaran</Label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full h-11 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 font-bold bg-white dark:bg-zinc-900 text-black dark:text-white text-xs md:text-sm outline-none"
                  >
                    <option value="PROFANITY">Profanity (Kata Kasar)</option>
                    <option value="GAMBLING">Gambling (Judi)</option>
                    <option value="SCAM">Scam / Spam</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>

                <DialogFooter className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-12 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-2xl font-black italic text-xs md:text-sm transition-all shadow-md"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Kata Sensor"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* TABS SELECTOR */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-zinc-900 rounded-2xl w-full sm:w-fit font-black italic text-xs">
        <button
          onClick={() => setActiveTab("custom")}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl transition-all ${
            activeTab === "custom"
              ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-white"
              : "text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-400"
          }`}
        >
          Kata Sensor Kustom ({customWords.length})
        </button>
        <button
          onClick={() => setActiveTab("global")}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl transition-all ${
            activeTab === "global"
              ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-white"
              : "text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-400"
          }`}
        >
          Sensor Default Sistem / Global ({globalWords.length})
        </button>
      </div>

      {/* FILTER & SEARCH CARD */}
      <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211]">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={activeTab === "custom" ? "Cari kata sensor kustom..." : "Cari kata sensor global..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs md:text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="h-10 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 bg-white dark:bg-zinc-900 text-xs md:text-sm outline-none w-full md:w-44 font-bold text-slate-600 dark:text-slate-200"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="PROFANITY">Profanity</option>
              <option value="GAMBLING">Gambling</option>
              <option value="SCAM">Scam</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* DATA LIST CARD */}
      <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm bg-white dark:bg-[#121211] overflow-hidden">
        <CardHeader className="py-4 px-6 bg-[#FAF9F6] dark:bg-[#1E1E1D]/20 border-b border-slate-100 dark:border-zinc-900 flex flex-row justify-between items-center">
          <CardTitle className="font-black italic text-xs tracking-wider text-black dark:text-[#FFD551]">
            {activeTab === "custom" 
              ? `Daftar Kata Sensor Kustom (${filteredWords.length})` 
              : `Daftar Kata Sensor Global Sistem (${filteredWords.length})`}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={fetchFilterWords} 
            disabled={loading}
            className="h-8 w-8 text-slate-400 hover:text-black dark:hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-xs md:text-sm font-bold text-slate-400 dark:text-zinc-500 italic flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-[#FFD551]" /> Memuat data kata sensor...
            </div>
          ) : paginatedWords.length === 0 ? (
            <div className="p-12 text-center text-xs md:text-sm font-bold text-slate-400 dark:text-zinc-500 italic">
              Tidak ada kata sensor yang ditemukan.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/20">
                  <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                    <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm px-8">Kata Sensor</TableHead>
                    <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Kategori</TableHead>
                    <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Ditambahkan Pada</TableHead>
                    <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm text-right px-8">
                      {activeTab === "custom" ? "Aksi" : "Status"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedWords.map((item) => (
                    <TableRow key={item.id} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30">
                      <TableCell className="font-black italic text-xs md:text-sm px-8 text-black dark:text-white">
                        {item.word}
                      </TableCell>
                      <TableCell>
                        <Badge className={`font-black italic text-[10px] rounded-lg px-2.5 py-0.5 border ${
                          item.type === 'GAMBLING' 
                            ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                            : item.type === 'PROFANITY' 
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                              : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs md:text-sm font-bold text-slate-400 italic">
                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </TableCell>
                      <TableCell className="text-right px-8">
                        {activeTab === "custom" ? (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleDeleteWord(item.id, item.word)}
                            className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Badge className="font-black italic text-[10px] rounded-lg px-2.5 py-0.5 border bg-slate-100 text-slate-400 border-slate-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700 inline-flex items-center gap-1">
                            <Lock className="h-3 w-3" /> SISTEM
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-zinc-800/60 bg-slate-50/30 dark:bg-zinc-900/20">
                  <div className="text-[10px] font-black italic text-slate-400 dark:text-zinc-500">
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredWords.length)} dari {filteredWords.length} kata
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="h-8 w-8 rounded-lg"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-black italic px-2">
                      Hal. {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="h-8 w-8 rounded-lg"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
