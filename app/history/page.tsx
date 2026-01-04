"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import PrivateLayout from "../components/PrivateLayout";
import Spinner from "../components/Spinner";
import Panel from "../components/Panel";
import { useProfiles } from "../hooks/useProfiles";
import { usePosts } from "../hooks/usePosts";
import { getProfilePublishedPosts } from "../lib/supabase/published-posts";
import { Calendar, Trash2, Eye, Globe, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Post } from "../types/Post";
import Image from "next/image";

// Mapeo de redes sociales a íconos
const getNetworkIcon = (network: string) => {
  const networkLower = network.toLowerCase();
  const iconMap: Record<string, string> = {
    instagram: "/instagram.svg",
    tiktok: "/tiktok.svg",
    x: "/x.svg",
    twitter: "/x.svg",
    facebook: "/facebook.svg",
    linkedin: "/linkedin.svg",
    youtube: "/youtube.svg",
    pinterest: "/pinterest.svg",
    reddit: "/reddit.svg",
    threads: "/threads.svg",
    bluesky: "/bluesky.svg",
  };
  return iconMap[networkLower] || "/globe.svg";
};

export default function HistoryPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"drafts" | "published">("drafts");
  const [publishedPosts, setPublishedPosts] = useState<any[]>([]);
  const [loadingPublished, setLoadingPublished] = useState(false);

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

  // Cargar publicaciones cuando cambia el perfil
  useEffect(() => {
    if (selected?.id) {
      loadPublishedPosts();
    }
  }, [selected?.id]);

  const loadPublishedPosts = async () => {
    setLoadingPublished(true);
    try {
      if (selected?.id) {
        const posts = await getProfilePublishedPosts(selected.id);
        console.log("📢 Posts cargados:", posts);
        console.log("🔍 Networks del primer post:", posts?.[0]?.networks);
        console.log("🔍 post_urls del primer post:", posts?.[0]?.post_urls);
        setPublishedPosts(posts || []);
      }
    } catch (err) {
      console.error("Error loading published posts:", err);
    } finally {
      setLoadingPublished(false);
    }
  };

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
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-10 flex justify-center">
        <div className="w-full max-w-6xl bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-gray-200">
          <Panel>
          <div className="mb-8 flex justify-between items-center">
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

          {/* TABS */}
          <div className="mb-8 flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("drafts")}
              className={`px-6 py-3 font-semibold text-sm transition border-b-2 ${
                activeTab === "drafts"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              Borradores
            </button>
            <button
              onClick={() => setActiveTab("published")}
              className={`px-6 py-3 font-semibold text-sm transition border-b-2 ${
                activeTab === "published"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              Publicaciones
            </button>
          </div>

          {/* CONTENT BY TAB */}
          {activeTab === "drafts" ? (
            // DRAFTS TAB
            <>
          {/* POSTS LIST */}
          {loadingPosts ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
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
                  className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
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
                            className="px-3 py-1 bg-gray-200 text-gray-800 text-xs font-medium rounded-full"
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
            </>
          ) : (
            // PUBLISHED TAB
            <>
          {loadingPublished ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : publishedPosts.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
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
              {publishedPosts.map((post: any) => (
                <div
                  key={post.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {post.description}
                        </p>
                      )}

                      {/* METADATA */}
                      <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {new Date(post.published_at).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>

                      {/* NETWORKS WITH URLS */}
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-gray-600 mb-3 uppercase">Publicado en:</p>
                        <div className="flex flex-wrap gap-3">
                          {post.networks && Array.isArray(post.networks) && post.networks.map((network: string) => {
                            const url = post.post_urls?.[network];
                            const iconPath = getNetworkIcon(network);
                            const networkDisplay = network ? network.charAt(0).toUpperCase() + network.slice(1) : "Red Social";
                            
                            return (
                              <a
                                key={`${network}-${url}`}
                                href={url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg transition group ${url ? 'hover:shadow-lg hover:border-blue-300 hover:from-blue-50 hover:to-blue-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                                title={url ? `Ver ${networkDisplay}` : `Sin URL para ${networkDisplay}`}
                              >
                                <div className="w-5 h-5 relative flex-shrink-0">
                                  <Image
                                    src={iconPath}
                                    alt={networkDisplay}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                                <span className="font-medium text-gray-700 group-hover:text-blue-600 transition text-sm">
                                  {networkDisplay}
                                </span>
                                {url && <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition flex-shrink-0" />}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* STATUS BADGE */}
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        <Eye size={14} />
                        Publicado
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
            </>
          )}
        </Panel>
        </div>
      </div>
    </PrivateLayout>
  );
}
