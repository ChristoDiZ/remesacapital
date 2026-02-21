"use client";

import { useEffect, useMemo, useState } from "react";

type Exec = {
  _id: string;
  name: string;
  phone: string;
  active: boolean;
  order: number;
};

type EditRow = {
  name: string;
  phone: string;
  order: string;
  active: boolean;
};

export default function AdminExecutivesPage() {
  const [list, setList] = useState<Exec[]>([]);
  const [loading, setLoading] = useState(true);

  // create form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState("0");
  const [creating, setCreating] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditRow | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/executives", { cache: "no-store" });
    const data = await res.json();
    setList(data?.executives || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createExec() {
    setCreating(true);
    setMsg(null);

    const res = await fetch("/api/admin/executives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        order: Number(order),
        active: true,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setMsg(data?.message || "Error al crear");
      setCreating(false);
      return;
    }

    setName("");
    setPhone("");
    setOrder("0");
    setCreating(false);
    setMsg("Ejecutivo creado ✅");
    await load();
  }

  function startEdit(ex: Exec) {
    setMsg(null);
    setEditingId(ex._id);
    setEdit({
      name: ex.name,
      phone: ex.phone,
      order: String(ex.order ?? 0),
      active: Boolean(ex.active),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEdit(null);
  }

  const canSave = useMemo(() => {
    if (!edit) return false;
    const orderNum = Number(edit.order);
    return edit.name.trim().length > 0 && edit.phone.trim().length > 0 && Number.isFinite(orderNum);
  }, [edit]);

  async function saveEdit() {
    if (!editingId || !edit) return;
    setSavingId(editingId);
    setMsg(null);

    const res = await fetch(`/api/admin/executives/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: edit.name.trim(),
        phone: edit.phone.trim(),
        order: Number(edit.order),
        active: edit.active,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setMsg(data?.message || "Error al guardar");
      setSavingId(null);
      return;
    }

    setSavingId(null);
    setEditingId(null);
    setEdit(null);
    setMsg("Cambios guardados ✅");
    await load();
  }

  async function toggleActive(ex: Exec) {
    setMsg(null);
    const res = await fetch(`/api/admin/executives/${ex._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !ex.active }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setMsg(data?.message || "Error al actualizar");
      return;
    }
    await load();
  }

  async function removeExec(ex: Exec) {
    if (!confirm(`¿Eliminar a "${ex.name}"? (No se borran los registros)`)) return;

    setMsg(null);
    const res = await fetch(`/api/admin/executives/${ex._id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setMsg(data?.message || "Error al eliminar");
      return;
    }
    setMsg("Eliminado (oculto) ✅");
    if (editingId === ex._id) cancelEdit();
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-extrabold">Ejecutivos</h1>
        <p className="mt-1 text-white/70 text-sm">
          Se muestran en la página principal. <b>Orden</b> = posición (menor aparece primero).
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <div>
            <label className="text-sm text-white/80">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
              placeholder="Juan"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-white/80">WhatsApp (teléfono)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
              placeholder="+59170000001"
            />
          </div>

          <div>
            <label className="text-sm text-white/80">Orden</label>
            <input
              value={order}
              onChange={(e) => setOrder(e.target.value.replace(/[^\d-]/g, ""))}
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
              placeholder="1"
            />
          </div>
        </div>

        <button
          onClick={createExec}
          disabled={creating || !name.trim() || !phone.trim()}
          className="mt-5 rounded-xl bg-white text-black font-semibold px-5 py-3 disabled:opacity-60"
        >
          {creating ? "Creando..." : "Crear ejecutivo"}
        </button>

        {msg && <p className="mt-3 text-sm text-white/80">{msg}</p>}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-bold text-lg">Listado</h2>

        {loading ? (
          <p className="mt-6 text-white/60">Cargando...</p>
        ) : list.length === 0 ? (
          <p className="mt-6 text-white/60">Aún no hay ejecutivos.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {list.map((ex) => {
              const isEditing = editingId === ex._id;
              return (
                <div
                  key={ex._id}
                  className="rounded-xl border border-white/10 bg-black/20 p-4 flex flex-col gap-3"
                >
                  <div className="grid gap-3 md:grid-cols-4">
                    <div>
                      <label className="text-xs text-white/50">Nombre</label>
                      <input
                        value={isEditing ? edit?.name ?? "" : ex.name}
                        disabled={!isEditing}
                        onChange={(e) => setEdit((p) => (p ? { ...p, name: e.target.value } : p))}
                        className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30 disabled:opacity-70"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs text-white/50">WhatsApp</label>
                      <input
                        value={isEditing ? edit?.phone ?? "" : ex.phone}
                        disabled={!isEditing}
                        onChange={(e) => setEdit((p) => (p ? { ...p, phone: e.target.value } : p))}
                        className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30 disabled:opacity-70"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/50">Orden</label>
                      <input
                        value={isEditing ? edit?.order ?? "" : String(ex.order ?? 0)}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setEdit((p) =>
                            p ? { ...p, order: e.target.value.replace(/[^\d-]/g, "") } : p
                          )
                        }
                        className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30 disabled:opacity-70"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/60">
                        Estado:{" "}
                        <b className={ex.active ? "text-green-200" : "text-yellow-200"}>
                          {ex.active ? "Activo" : "Inactivo"}
                        </b>
                      </span>

                      <button
                        onClick={() => toggleActive(ex)}
                        className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
                      >
                        {ex.active ? "Desactivar" : "Activar"}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isEditing ? (
                        <button
                          onClick={() => startEdit(ex)}
                          className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
                        >
                          Editar
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={cancelEdit}
                            className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={saveEdit}
                            disabled={!canSave || savingId === ex._id}
                            className="rounded-xl bg-white text-black font-semibold px-3 py-2 text-sm disabled:opacity-60"
                          >
                            {savingId === ex._id ? "Guardando..." : "Guardar"}
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => removeExec(ex)}
                        className="rounded-xl border border-red-500/30 text-red-200 px-3 py-2 text-sm hover:bg-red-500/10"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-4 text-xs text-white/50">
          Orden menor aparece primero en la web pública.
        </p>
      </div>
    </div>
  );
}