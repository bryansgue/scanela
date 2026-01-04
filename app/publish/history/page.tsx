"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import PrivateLayout from "../../components/PrivateLayout";
import Spinner from "../../components/Spinner";
import { useProfiles } from "../../hooks/useProfiles";
import { usePosts } from "../../hooks/usePosts";
import { Calendar, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { Post } from "../../types/Post";

export default function PublishHistoryPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const {
    profiles,
    selected,
    setSelected,
    loading: loadingProfiles,
  } = useProfiles(user?.id || null);

  const {
    posts,
    loading: loadingPosts,
    removePost,
  } = usePosts(selected?.id ?? null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    load();
  }, []);

  if (loading || loadingProfiles) {
    return <Spinner />;
  }

  if (!profiles || profiles.length === 0) {
    return (
      <PrivateLayout user={user}>
        <div className="max-w-6xl mx-auto p-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No hay perfiles
            </h2>
            <p className="text-gray-600 mb-6">
              Crea un perfil para ver tu historial de publicaciones.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ir al Dashboard
            </Link>
          </div>
        </div>
      </PrivateLayout>
    );
  }

  const handleDelete = (postId: string) => {
    if (confirm("¿Estás seguro que quieres eliminar esta publicación?")) {
      removePost(postId);
    }
  };

  return (
    <PrivateLayout user={user}>
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Historial de Publicaciones
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona tus posts y contenido programado
            </p>
          </div>
          <Link
            href="/publish"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Nueva Publicación
          </Link>
        </div>

        {/* PROFILE SELECTOR */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Selecciona Perfil
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelected(profile)}
                className={`
                  px-4 py-2 rounded-lg whitespace-nowrap font-medium text-sm transition border-2
                  ${
                    selected?.id === profile.id
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300"
                  }
                `}
              >
                {profile.profile_name}
              </button>
            ))}
          </div>
        </div>

        {/* POSTS LIST */}
        {loadingPosts ? (
          <Spinner />
        ) : posts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sin publicaciones
            </h3>
            <p className="text-gray-600 mb-6">
              No hay publicaciones en este perfil. Crea una nueva para comenzar.
            </p>
            <Link
              href="/publish"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Crear Publicación
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post: Post) => (
              <div
                key={post.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {post.description}
                    </p>

                    {/* METADATA */}
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        {new Date(post.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>

                      {post.is_scheduled && (
                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">
                          <Calendar size={16} />
                          Programado:{" "}
                          {new Date(post.scheduled_for!).toLocaleDateString(
                            "es-ES"
                          )}
                        </div>
                      )}

                      {post.is_published && !post.is_scheduled && (
                        <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                          <Eye size={16} />
                          Publicado
                        </div>
                      )}
                    </div>

                    {/* NETWORKS */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.networks?.map((network: string) => (
                        <span
                          key={network}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                        >
                          {network}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PrivateLayout>
  );
}
