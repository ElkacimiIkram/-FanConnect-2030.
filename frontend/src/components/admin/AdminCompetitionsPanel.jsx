import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Spinner from '../ui/Spinner';
import { getApiData, getApiError } from '../../utils/apiHelpers';
import { COMPETITION_CATEGORY_LABELS } from '../../utils/matchLabels';

const CATEGORIES = Object.keys(COMPETITION_CATEGORY_LABELS);

const EMPTY_FORM = {
  name: '',
  slug: '',
  category: 'WORLD_CUP',
  season: '',
  description: '',
  externalCode: '',
  active: true,
};

export default function AdminCompetitionsPanel({ onError }) {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [localMessage, setLocalMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getCompetitions();
      setCompetitions(getApiData(response) || []);
    } catch (err) {
      onError?.(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setLocalMessage('');
    try {
      const payload = {
        ...form,
        active: Boolean(form.active),
      };
      if (editingId) {
        await adminApi.updateCompetition(editingId, payload);
      } else {
        await adminApi.createCompetition(payload);
      }
      resetForm();
      await load();
      setLocalMessage('Compétition enregistrée.');
    } catch (err) {
      onError?.(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (competition) => {
    setEditingId(competition.id);
    setForm({
      name: competition.name,
      slug: competition.slug,
      category: competition.category,
      season: competition.season || '',
      description: competition.description || '',
      externalCode: competition.externalCode || '',
      active: competition.active,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette compétition ?')) return;
    try {
      await adminApi.deleteCompetition(id);
      if (editingId === id) resetForm();
      await load();
    } catch (err) {
      onError?.(getApiError(err));
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    setLocalMessage('');
    try {
      const response = await adminApi.syncAllCompetitions();
      const count = getApiData(response);
      setLocalMessage(`${count} match(s) synchronisé(s) depuis football-data.org.`);
      await load();
    } catch (err) {
      onError?.(getApiError(err));
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSync = async (id) => {
    setSyncingId(id);
    setLocalMessage('');
    try {
      const response = await adminApi.syncCompetition(id);
      const count = getApiData(response);
      setLocalMessage(`${count} match(s) synchronisé(s) depuis football-data.org.`);
      await load();
    } catch (err) {
      onError?.(getApiError(err));
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          {editingId ? 'Modifier la compétition' : 'Nouvelle compétition'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Gérez World Cup, Champions League, CAN, etc. Code externe WC/CL pour sync football-data.org.
        </p>

        <form onSubmit={handleSave} className="mt-4 grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Nom (ex. Coupe du Monde FIFA 2026)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            placeholder="Slug (ex. world-cup-2026)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            required
          />
          <select
            className="rounded-lg border border-gray-300 px-4 py-2"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {COMPETITION_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
          <Input
            placeholder="Saison (ex. 2026)"
            value={form.season}
            onChange={(e) => setForm({ ...form, season: e.target.value })}
          />
          <Input
            className="md:col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            placeholder="Code externe (WC, CL…)"
            value={form.externalCode}
            onChange={(e) => setForm({ ...form, externalCode: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active sur le Match Center
          </label>

          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer'}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Annuler
              </Button>
            )}
          </div>
        </form>

        {localMessage && (
          <div className="mt-4">
            <Alert variant="success">{localMessage}</Alert>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button variant="secondary" disabled={syncingAll} onClick={handleSyncAll}>
          {syncingAll ? 'Synchronisation...' : 'Sync toutes les compétitions'}
        </Button>
      </div>

      {loading ? (
        <Spinner label="Chargement des compétitions..." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-slate-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Matchs</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {competitions.map((competition) => (
                <tr key={competition.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{competition.name}</td>
                  <td className="px-4 py-3">
                    {COMPETITION_CATEGORY_LABELS[competition.category] || competition.category}
                  </td>
                  <td className="px-4 py-3">{competition.externalCode || '—'}</td>
                  <td className="px-4 py-3">{competition.matchCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(competition)}>
                        Modifier
                      </Button>
                      {competition.externalCode && (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={syncingId === competition.id}
                          onClick={() => handleSync(competition.id)}
                        >
                          {syncingId === competition.id ? 'Sync...' : 'Sync FIFA/API'}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(competition.id)}>
                        Supprimer
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}