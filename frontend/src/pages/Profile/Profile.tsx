import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Calendar, 
  Star, 
  DollarSign, 
  Clock, 
  Award,
  Trophy,
  Briefcase,
  GraduationCap,
  Globe,
  MessageSquare,
  Edit,
  Plus,
  ExternalLink,
  CheckCircle,
  Clock as ClockIcon
} from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { useAuthStore } from '../../store/auth';
import { LevelProgress } from '../../components/Achievements/LevelProgress';
import { AchievementCard } from '../../components/Achievements/AchievementCard';
import { useTranslation } from 'react-i18next';

export const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuthStore();
  const { 
    profile, 
    loading, 
    error, 
    fetchProfile,
    parseSkills,
    parseSocialLinks 
  } = useProfile();
  const { i18n } = useTranslation();
  const userLang = i18n.language || 'en';
  const [bioTranslated, setBioTranslated] = useState<{ text: string, detectedLang: string } | null>(null);
  const [bioLoading, setBioLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'certificates' | 'reviews' | 'achievements'>('overview');

  useEffect(() => {
    if (userId) {
      fetchProfile(parseInt(userId));
    }
  }, [userId, fetchProfile]);

  useEffect(() => {
    let ignore = false;
    async function translateBioIfNeeded() {
      if (!profile?.bio) return;
      setBioLoading(true);
      try {
        const detectedLang = 'en'; // TODO: заменить на определение языка bio
        if (userLang !== detectedLang) {
          const resp = await fetch('/api/v1/ai/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: profile.bio,
              source_lang: detectedLang,
              target_lang: userLang
            })
          });
          const data = await resp.json();
          if (!ignore) {
            setBioTranslated({
              text: data.translated_text,
              detectedLang: data.detected_source_lang || detectedLang
            });
          }
        } else {
          setBioTranslated(null);
        }
      } catch (e) {
        setBioTranslated(null);
      } finally {
        setBioLoading(false);
      }
    }
    translateBioIfNeeded();
    return () => { ignore = true; };
  }, [profile?.bio, userLang]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Profile not found'}</p>
          <Link to="/dashboard" className="text-blue-500 hover:text-blue-600">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;
  const skills = parseSkills(profile.skills);
  const socialLinks = parseSocialLinks(profile.social_links);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'certificates', label: 'Certificates', icon: GraduationCap },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg">
            {/* Cover Image Placeholder */}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            
            {/* Profile Actions */}
            {isOwnProfile && (
              <div className="absolute top-4 right-4">
                <Link
                  to={`/profile/${profile.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Link>
              </div>
          )}
          </div>
          
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="absolute -top-16 left-6">
              <div className="w-32 h-32 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={profile.first_name || profile.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {profile.first_name?.[0] || profile.username[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="ml-40 pt-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {profile.first_name && profile.last_name 
                      ? `${profile.first_name} ${profile.last_name}`
                      : profile.username
                    }
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    @{profile.username}
                  </p>
                  {bioTranslated ? (
                    <>
                      <p className="text-gray-700 dark:text-gray-300 max-w-2xl">
                        {bioLoading ? <span className="animate-pulse text-xs text-muted-foreground">Translating...</span> : bioTranslated.text}
                      </p>
                      <div className="text-xs text-gray-400 mt-1">
                        <span className="font-semibold">Original:</span> {profile.bio}
                      </div>
                    </>
                  ) : profile.bio && (
                    <p className="text-gray-700 dark:text-gray-300 max-w-2xl">
                      {profile.bio}
                    </p>
                  )}
                </div>
                
                <div className="text-right">
                  {profile.is_verified && (
                    <div className="flex items-center gap-1 text-green-600 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {new Date(profile.created_at).getFullYear()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.tasks_completed || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.user_rating_value ? profile.user_rating_value.toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${profile.total_earnings?.toFixed(0) || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.profile_completion_percentage || 0}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Profile Complete</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Level Progress */}
              {profile.level_info && (
                <LevelProgress userLevel={profile.level_info} />
              )}
              
              {/* Skills */}
              {skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Experience & Education */}
              <div className="grid md:grid-cols-2 gap-6">
                {profile.experience_years && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Experience
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-5 h-5" />
                      <span>{profile.experience_years} years of experience</span>
                    </div>
                  </div>
                )}
                
                {profile.education && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Education
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {profile.education}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Social Links */}
              {Object.keys(socialLinks).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Social Links
                  </h3>
                  <div className="flex gap-3">
                    {Object.entries(socialLinks).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Portfolio ({profile.portfolio_items.length})
                </h3>
                {isOwnProfile && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Portfolio Item
                  </button>
                )}
              </div>
              
              {profile.portfolio_items.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No portfolio items yet</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profile.portfolio_items.map((item) => (
                    <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                            {item.description}
                          </p>
                        )}
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Project
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'certificates' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Certificates ({profile.certificates.length})
                </h3>
                {isOwnProfile && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Certificate
                  </button>
                )}
              </div>
              
              {profile.certificates.length === 0 ? (
                <div className="text-center py-8">
                  <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No certificates yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.certificates.map((cert) => (
                    <div key={cert.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {cert.name}
                          </h4>
                          {cert.issuer && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                              Issued by {cert.issuer}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            {cert.issue_date && (
                              <span>Issued: {new Date(cert.issue_date).toLocaleDateString()}</span>
                            )}
                            {cert.expiration_date && (
                              <span>Expires: {new Date(cert.expiration_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        {cert.credential_url && (
                          <a
                            href={cert.credential_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Verify
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Reviews ({profile.reviews.length})
              </h3>
              
              {profile.reviews.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {review.rating}/5
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {review.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Achievements ({profile.achievements.length})
              </h3>
              
              {profile.achievements.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No achievements yet</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.achievements.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
