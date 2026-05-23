"use client"

import React, { useState, useEffect, useRef } from "react"
import { 
  Search, 
  Plus, 
  Trash2, 
  Ban, 
  ShieldAlert, 
  AlertTriangle,
  LayoutGrid,
  TableProperties,
  Upload,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle2,
  X
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ADMIN_API } from "@/lib/api"

export default function FilterWordsTab() {
  const [words, setWords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<"ALL" | "GAMBLING" | "PROFANITY">("ALL")
  
  // Layout and Pagination settings
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isBulkOpen, setIsBulkOpen] = useState(false)

  // Add form state
  const [newWord, setNewWord] = useState("")
  const [newType, setNewType] = useState<"GAMBLING" | "PROFANITY">("GAMBLING")

  // Bulk upload state
  const [bulkInputText, setBulkInputText] = useState("")
  const [bulkDefaultType, setBulkDefaultType] = useState<"GAMBLING" | "PROFANITY">("GAMBLING")
  const [parsedWordsCount, setParsedWordsCount] = useState(0)
  const [parsedWordsList, setParsedWordsList] = useState<string[]>([])
  const [isBulkUploading, setIsBulkUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Delete state
  const [deleteWordId, setDeleteWordId] = useState("")
  const [deleteWordText, setDeleteWordText] = useState("")

  // Fetch words from API
  const fetchWords = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(ADMIN_API.filterWords)
      const json = await res.json()
      if (json.success) {
        setWords(json.data || [])
      } else {
        toast.error("Gagal memuat daftar kata sensor.")
      }
    } catch (err) {
      console.error("Error loading filter words:", err)
      toast.error("Kesalahan koneksi ke server.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWords()
  }, [])

  // CRUD: Add Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWord.trim()) {
      toast.error("Kata sensor wajib diisi!")
      return
    }

    try {
      const res = await fetch(ADMIN_API.filterWords, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: newWord.trim(),
          type: newType
        })
      })
      const data = await res.json()

      if (data.success) {
        toast.success(`Kata "${newWord.trim()}" berhasil ditambahkan ke daftar sensor!`)
        setIsAddOpen(false)
        setNewWord("")
        setNewType("GAMBLING")
        fetchWords()
      } else {
        toast.error(data.message || "Gagal menambahkan kata sensor.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal menghubungkan ke server API.")
    }
  }

  // CRUD: Open Delete Confirm Modal
  const openDeleteConfirm = (wordItem: any) => {
    setDeleteWordId(wordItem.id)
    setDeleteWordText(wordItem.word)
    setIsDeleteOpen(true)
  }

  // CRUD: Delete Submit
  const handleDeleteSubmit = async () => {
    try {
      const res = await fetch(ADMIN_API.filterWordById(deleteWordId), {
        method: "DELETE"
      })
      const data = await res.json()

      if (data.success) {
        toast.success(`Kata "${deleteWordText}" berhasil dihapus dari daftar sensor.`)
        setIsDeleteOpen(false)
        fetchWords()
      } else {
        toast.error(data.message || "Gagal menghapus kata sensor.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal menghubungkan ke server API.")
    }
  }

  // Parse bulk input helper
  const updateParsedList = (text: string) => {
    // split by comma, newline or semicolon
    const items = text
      .split(/[\n,;]+/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 0)
    setParsedWordsList(items)
    setParsedWordsCount(items.length)
  }

  // Handle manual text changes in textarea
  const handleBulkTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setBulkInputText(val)
    updateParsedList(val)
  }

  // Handle CSV/TXT file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (text) {
        setBulkInputText(text)
        updateParsedList(text)
        toast.success(`Berhasil mengimpor file: ${file.name}`)
      }
    }
    reader.onerror = () => {
      toast.error("Gagal membaca file.")
    }
    reader.readAsText(file)
  }

  // Clear bulk form
  const handleClearBulkForm = () => {
    setBulkInputText("")
    setParsedWordsList([])
    setParsedWordsCount(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Bulk Submit
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (parsedWordsList.length === 0) {
      toast.error("Tidak ada kata sensor yang terdeteksi untuk diunggah!")
      return
    }
    setIsBulkUploading(true)

    try {
      const res = await fetch(`${ADMIN_API.filterWords}/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          words: parsedWordsList,
          defaultType: bulkDefaultType
        })
      })
      const data = await res.json()

      if (data.success) {
        toast.success(
          `Impor sukses! ${data.insertedCount} kata baru ditambahkan, ${data.skippedCount} kata duplikat dilewati.`
        )
        setIsBulkOpen(false)
        handleClearBulkForm()
        fetchWords()
      } else {
        toast.error(data.message || "Gagal mengimpor kata-kata massal.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal menghubungi server API.")
    } finally {
      setIsBulkUploading(false)
    }
  }

  // Filters & Search
  const filteredWords = words.filter(w => {
    const matchesSearch = w.word.toLowerCase().includes(searchQuery.toLowerCase())
    if (activeFilter === "ALL") return matchesSearch
    return matchesSearch && w.type === activeFilter
  })

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredWords.length / itemsPerPage))
  const paginatedWords = filteredWords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeFilter])

  const gamblingCount = words.filter(w => w.type === "GAMBLING").length
  const profanityCount = words.filter(w => w.type === "PROFANITY").length

  return (
    <div className="space-y-6 w-full text-[#1A1A19] dark:text-[#EAE9E4]">
      
      {/* Counters Bento Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <Card className="border border-slate-200 dark:border-zinc-800/80 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] bg-white dark:bg-[#121211] p-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Kategori</span>
            <h3 className="text-3xl font-black italic tracking-tighter mt-1 text-[#FFD551]">2 Kategori</h3>
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 italic mt-3">Judi Online & Profanitas/Kata Kasar</p>
        </Card>
        
        <Card className="border border-slate-200 dark:border-zinc-800/80 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] bg-white dark:bg-[#121211] p-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Keywords Judi Online</span>
            <h3 className="text-3xl font-black italic tracking-tighter mt-1 text-red-500">{gamblingCount} Kata</h3>
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 italic mt-3">Mencegah promosi slot, gacor, depo, jp, dll.</p>
        </Card>

        <Card className="border border-slate-200 dark:border-zinc-800/80 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] bg-white dark:bg-[#121211] p-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Keywords Kata Kasar</span>
            <h3 className="text-3xl font-black italic tracking-tighter mt-1 text-amber-500">{profanityCount} Kata</h3>
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 italic mt-3">Menghalau caci maki dan ucapan tidak sopan.</p>
        </Card>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 p-4 rounded-[2rem] shadow-sm w-full">
        
        {/* Category Filter tabs */}
        <div className="flex gap-1.5 bg-[#FAF9F6] dark:bg-zinc-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-zinc-850 w-full lg:w-auto overflow-x-auto">
          <Button
            size="sm"
            onClick={() => setActiveFilter("ALL")}
            className={`h-9 px-4 text-xs font-black italic rounded-xl border-none shadow-none cursor-pointer transition-all ${
              activeFilter === "ALL"
                ? "bg-[#FFD551] text-black font-black hover:bg-[#FFD551]"
                : "bg-transparent text-slate-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-zinc-800/50"
            }`}
          >
            Semua ({words.length})
          </Button>
          <Button
            size="sm"
            onClick={() => setActiveFilter("GAMBLING")}
            className={`h-9 px-4 text-xs font-black italic rounded-xl border-none shadow-none cursor-pointer transition-all ${
              activeFilter === "GAMBLING"
                ? "bg-red-500 text-white font-black hover:bg-red-500"
                : "bg-transparent text-slate-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-zinc-800/50"
            }`}
          >
            Judi Online ({gamblingCount})
          </Button>
          <Button
            size="sm"
            onClick={() => setActiveFilter("PROFANITY")}
            className={`h-9 px-4 text-xs font-black italic rounded-xl border-none shadow-none cursor-pointer transition-all ${
              activeFilter === "PROFANITY"
                ? "bg-amber-500 text-white font-black hover:bg-amber-500"
                : "bg-transparent text-slate-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-zinc-800/50"
            }`}
          >
            Kata Kasar ({profanityCount})
          </Button>
        </div>

        {/* Layout Toggle (Table vs Grid) */}
        <div className="flex bg-[#FAF9F6] dark:bg-zinc-900/60 p-1 rounded-xl border border-slate-200/50 dark:border-zinc-800 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setViewMode("table")}
            className={`h-8 w-8 rounded-lg transition-all border-none ${
              viewMode === "table"
                ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm"
                : "text-slate-450 dark:text-zinc-500 hover:text-slate-700"
            }`}
          >
            <TableProperties className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setViewMode("grid")}
            className={`h-8 w-8 rounded-lg transition-all border-none ${
              viewMode === "grid"
                ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm"
                : "text-slate-450 dark:text-zinc-500 hover:text-slate-700"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari kata sensor terdaftar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-[#121211] dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
          />
        </div>

        {/* Bulk Dialog Button */}
        <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
          <DialogTrigger
            render={
              <Button className="bg-black hover:bg-slate-900 text-[#FFD551] dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-black italic h-11 px-4 rounded-2xl shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer">
                <Upload className="mr-1 h-4 w-4" /> Impor Massal (CSV/TXT)
              </Button>
            }
          />
          <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-black text-2xl italic tracking-tighter text-black dark:text-white flex items-center gap-2">
                Impor Massal Kata Sensor
              </DialogTitle>
              <DialogDescription className="text-xs font-bold italic text-slate-400">
                Unggah file CSV/TXT atau tempel kata-kata terlarang dipisahkan koma atau baris baru.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBulkSubmit} className="space-y-4 pt-2 text-[#1A1A19] dark:text-white">
              
              {/* File Selector */}
              <div className="space-y-2">
                <Label className="text-xs font-black italic text-slate-500 dark:text-zinc-400">Unggah File (.csv / .txt)</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept=".csv,.txt"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-zinc-900 dark:text-white text-xs"
                  />
                  {parsedWordsCount > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearBulkForm}
                      className="h-10 text-red-500 border border-slate-200 rounded-xl text-xs"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {/* Textarea paste */}
              <div className="space-y-2">
                <Label className="text-xs font-black italic text-slate-500 dark:text-zinc-400">Atau Tempel Kata-kata Sensor</Label>
                <textarea
                  rows={4}
                  value={bulkInputText}
                  onChange={handleBulkTextChange}
                  placeholder="Contoh: kata1, kata2, kata3&#10;kata4&#10;kata5"
                  className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-white text-xs p-3 focus:outline-none focus:ring-1 focus:ring-[#FFD551] resize-none leading-relaxed"
                />
                {parsedWordsCount > 0 && (
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 italic">
                    Terdeteksi {parsedWordsCount} kata sensor siap diimpor.
                  </p>
                )}
              </div>

              {/* Default category select */}
              <div className="space-y-2">
                <Label className="text-xs font-black italic text-slate-500 dark:text-zinc-400">Kategori Default Pelanggaran</Label>
                <select
                  value={bulkDefaultType}
                  onChange={(e) => setBulkDefaultType(e.target.value as any)}
                  className="w-full h-11 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 text-sm bg-white dark:bg-zinc-900 text-black dark:text-white font-bold outline-none"
                >
                  <option value="GAMBLING">Judi Online (Slot, Togel, Casino, Depo, dll)</option>
                  <option value="PROFANITY">Profanitas & Swear Words (Kata Kasar/SARA)</option>
                </select>
              </div>

              <DialogFooter className="pt-2">
                <Button 
                  type="submit" 
                  disabled={isBulkUploading || parsedWordsCount === 0}
                  className="w-full h-12 bg-[#FFD551] text-black hover:bg-[#FFC83B] rounded-2xl font-black italic transition-all cursor-pointer border-none flex items-center justify-center gap-1.5"
                >
                  {isBulkUploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Mengimpor massal...
                    </>
                  ) : (
                    `Impor ${parsedWordsCount} Kata Sensor`
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Dialog Trigger */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger
            render={
              <Button className="bg-[#FFD551] text-black border border-slate-200 dark:border-zinc-800 hover:bg-[#FFC83B] text-xs font-black italic h-11 px-5 rounded-2xl shadow-sm transition-all active:scale-95 w-full lg:w-auto shrink-0 cursor-pointer">
                <Plus className="mr-1 h-4 w-4" /> Tambah Kata Sensor
              </Button>
            }
          />
          <DialogContent className="max-w-md bg-[#F8F7F3] dark:bg-[#121211] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-black text-2xl italic tracking-tighter text-black dark:text-white">Tambah Kata Sensor</DialogTitle>
              <DialogDescription className="text-xs font-bold italic text-slate-400">
                Kata ini akan disensor secara global pada pesan donasi jika streamer menyalakan filter kata kasar.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-2 text-[#1A1A19] dark:text-white">
              
              <div className="space-y-2">
                <Label className="text-xs font-black italic text-slate-500 dark:text-zinc-400">Kata Terlarang (Tanpa Spasi)</Label>
                <Input
                  required
                  placeholder="Contoh: gacor, slot88, anjing"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="h-11 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white text-black dark:bg-zinc-900 dark:text-white font-bold focus-visible:ring-2 focus-visible:ring-[#FFD551]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black italic text-slate-500 dark:text-zinc-400">Kategori Pelanggaran</Label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full h-11 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-sm bg-white dark:bg-zinc-900 text-black dark:text-white font-bold outline-none"
                >
                  <option value="GAMBLING">Judi Online (Slot, Togel, Casino, Depo, dll)</option>
                  <option value="PROFANITY">Profanitas & Swear Words (Kata Kasar/SARA)</option>
                </select>
              </div>

              <DialogFooter className="pt-2">
                <Button type="submit" className="w-full h-12 bg-black text-[#FFD551] dark:bg-[#FFD551] dark:text-black rounded-2xl font-black italic transition-all cursor-pointer">
                  Simpan ke Daftar Sensor
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Words Grid/List */}
      {isLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: itemsPerPage }).map((_, i) => (
              <div key={i} className="h-20 bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121211] p-8 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-50 dark:bg-zinc-900/60 rounded-xl animate-pulse" />
            ))}
          </div>
        )
      ) : paginatedWords.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#121211] border border-slate-200 dark:border-zinc-800 rounded-[2.5rem]">
          <Ban className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400 text-xs font-bold italic">Tidak ada kata terdaftar yang cocok.</p>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            /* GRID VIEW MODE */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
              {paginatedWords.map((wordItem) => (
                <Card 
                  key={wordItem.id} 
                  className="border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121211] shadow-[0_4px_20px_rgb(0,0,0,0.005)] overflow-hidden hover:border-[#FFD551] transition-all duration-300 flex items-center justify-between p-3.5 group"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-black uppercase italic truncate text-black dark:text-white">{wordItem.word}</span>
                    <div className="mt-1 flex items-center gap-1.5">
                      {wordItem.type === "GAMBLING" ? (
                        <Badge className="bg-red-500/10 text-red-500 dark:bg-red-950/20 dark:text-red-400 border-none rounded-md px-1 py-0 text-[8px] font-black uppercase">
                          Judi
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-500 dark:bg-amber-950/20 dark:text-amber-400 border-none rounded-md px-1 py-0 text-[8px] font-black uppercase">
                          Kasar
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDeleteConfirm(wordItem)}
                    className="h-8 w-8 p-0 border border-slate-100 dark:border-zinc-900 group-hover:border-red-150 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 group-hover:text-red-500 rounded-xl shrink-0 cursor-pointer transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            /* TABLE VIEW MODE (DEFAULT) */
            <Card className="border border-slate-200/80 dark:border-zinc-800/80 rounded-[2rem] bg-white dark:bg-[#121211] shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/20">
                  <TableRow className="border-b border-slate-100 dark:border-zinc-900">
                    <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm px-8">Kata Sensor</TableHead>
                    <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Kategori</TableHead>
                    <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm">Tanggal Dibuat</TableHead>
                    <TableHead className="font-bold italic text-slate-500 dark:text-zinc-400 text-xs md:text-sm text-right px-8">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedWords.map((wordItem) => (
                    <TableRow key={wordItem.id} className="border-b border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/30">
                      <TableCell className="font-black italic text-xs md:text-sm px-8 text-black dark:text-white">
                        {wordItem.word}
                      </TableCell>
                      <TableCell>
                        <Badge className={`font-black italic text-[10px] rounded-lg px-2.5 py-0.5 border ${
                          wordItem.type === 'GAMBLING' 
                            ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {wordItem.type === 'GAMBLING' ? 'Judi Online' : 'Kata Kasar'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs md:text-sm font-bold text-slate-400 italic">
                        {new Date(wordItem.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => openDeleteConfirm(wordItem)}
                          className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 px-6 py-4 border border-slate-200 dark:border-zinc-800 rounded-[2rem] bg-white dark:bg-zinc-900/20">
              <div className="text-[10px] font-black italic text-slate-450 dark:text-zinc-500">
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-[#F8F7F3] rounded-[2rem] border border-slate-200 dark:border-zinc-800 p-8 shadow-2xl text-[#1A1A19] dark:text-white">
          <DialogHeader>
            <DialogTitle className="font-black text-2xl italic tracking-tighter flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse shrink-0" /> Konfirmasi Hapus Kata
            </DialogTitle>
            <DialogDescription className="text-xs font-bold italic text-slate-400">
              Apakah Anda yakin ingin menghapus kata sensor ini dari daftar global? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-slate-100 dark:border-zinc-900 flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-amber-500 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black uppercase italic truncate">"{deleteWordText}"</span>
                <span className="text-[9px] font-mono text-slate-400 truncate">{deleteWordId}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                className="h-12 flex-1 border border-slate-200 text-slate-500 rounded-2xl font-black italic text-xs hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleDeleteSubmit}
                className="h-12 flex-1 bg-red-500 text-white hover:bg-red-600 rounded-2xl font-black italic text-xs transition-all cursor-pointer border-none"
              >
                Hapus Kata Sensor
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
