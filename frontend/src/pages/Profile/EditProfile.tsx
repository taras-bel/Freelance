import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  GraduationCap,
  Globe,
  Briefcase,
  Plus,
  X,
  Save,
  ArrowLeft,
  Upload,
  Trash2,
  Edit3
} from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { useAuthStore } from '../../store/auth';
import { AvatarUpload } from '../../components/Profile/AvatarUpload';
import { ProfilePreview } from '../../components/Profile/ProfilePreview';

// Validation schemas
const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().max(100).optional(),
  hourly_rate: z.number().min(0).max(1000).optional(),
  experience_years: z.number().min(0).max(50).optional(),
  education: z.string().max(200).optional(),
  languages: z.string().max(200).optional(),
  timezone: z.string().optional(),
  availability_status: z.string().optional(),
  availability_hours: z.string().optional(),
  communication_preferences: z.string().optional(),
  work_preferences: z.string().optional(),
});

const portfolioSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  image: z.string().optional(),
});

const certificateSchema = z.object({
  name: z.string().min(1, 'Certificate name is required').max(100),
  issuer: z.string().max(100).optional(),
  issue_date: z.string().optional(),
  expiration_date: z.string().optional(),
  credential_id: z.string().max(100).optional(),
  credential_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  file: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PortfolioFormData = z.infer<typeof portfolioSchema>;
type CertificateFormData = z.infer<typeof certificateSchema>;

export const EditProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { 
    profile, 
    loading, 
    error, 
    fetchProfile,
    updateProfile,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    parseSkills,
    parseSocialLinks,
    formatSkills,
    formatSocialLinks
  } = useProfile();

  const [activeTab, setActiveTab] = useState<'basic' | 'skills' | 'portfolio' | 'certificates'>('basic');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [editingPortfolio, setEditingPortfolio] = useState<number | null>(null);
  const [editingCertificate, setEditingCertificate] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const {
    control: portfolioControl,
    handleSubmit: handlePortfolioSubmit,
    formState: { errors: portfolioErrors, isSubmitting: portfolioSubmitting },
    reset: resetPortfolio
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
  });

  const {
    control: certificateControl,
    handleSubmit: handleCertificateSubmit,
    formState: { errors: certificateErrors, isSubmitting: certificateSubmitting },
    reset: resetCertificate
  } = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
  });

  useEffect(() => {
    if (userId) {
      fetchProfile(parseInt(userId));
    }
  }, [userId, fetchProfile]);

  useEffect(() => {
    if (profile) {
      // Reset form with profile data
      reset({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        hourly_rate: profile.hourly_rate || undefined,
        experience_years: profile.experience_years || undefined,
        education: profile.education || '',
        languages: profile.languages || '',
        timezone: profile.timezone || '',
        availability_status: profile.availability_status || '',
        availability_hours: profile.availability_hours || '',
        communication_preferences: profile.communication_preferences || '',
        work_preferences: profile.work_preferences || '',
      });

      // Set skills and social links
      setSkills(parseSkills(profile.skills));
      setSocialLinks(parseSocialLinks(profile.social_links));
    }
  }, [profile, reset, parseSkills, parseSocialLinks]);

  // Check if user can edit this profile
  if (!currentUser || !profile || currentUser.id !== profile.id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">You can only edit your own profile</p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 hover:text-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      const updateData = {
        ...data,
        skills: formatSkills(skills),
        social_links: formatSocialLinks(socialLinks),
      };
      
      await updateProfile(updateData);
      navigate(`/profile/${profile.id}`);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const onSubmitPortfolio = async (data: PortfolioFormData) => {
    try {
      if (editingPortfolio) {
        await updatePortfolioItem(editingPortfolio, data);
        setEditingPortfolio(null);
      } else {
        await createPortfolioItem(data);
      }
      resetPortfolio();
    } catch (error) {
      console.error('Failed to save portfolio item:', error);
    }
  };

  const onSubmitCertificate = async (data: CertificateFormData) => {
    try {
      if (editingCertificate) {
        await updateCertificate(editingCertificate, data);
        setEditingCertificate(null);
      } else {
        await createCertificate(data);
      }
      resetCertificate();
    } catch (error) {
      console.error('Failed to save certificate:', error);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const updateSocialLink = (platform: string, url: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: url
    }));
  };

  const removeSocialLink = (platform: string) => {
    const newSocialLinks = { ...socialLinks };
    delete newSocialLinks[platform];
    setSocialLinks(newSocialLinks);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'skills', label: 'Skills & Social', icon: Globe },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'certificates', label: 'Certificates', icon: GraduationCap },
  ];

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Profile
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Profile
            </h1>
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
          {activeTab === 'basic' && (
            <div className="grid lg:grid-cols-2 gap-8">
              <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h3>
                
                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Profile Picture
                  </label>
                  <AvatarUpload
                    currentAvatar={profile?.avatar}
                    onAvatarChange={(file) => {
                      // Handle avatar upload
                      console.log('Avatar file:', file);
                    }}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name *
                    </label>
                    <Controller
                      name="first_name"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your first name"
                        />
                      )}
                    />
                    {errors.first_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <Controller
                      name="last_name"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your last name"
                        />
                      )}
                    />
                    {errors.last_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <Controller
                    name="bio"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tell us about yourself..."
                      />
                    )}
                  />
                  {errors.bio && (
                    <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <Controller
                      name="location"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="City, Country"
                        />
                      )}
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hourly Rate ($)
                    </label>
                    <Controller
                      name="hourly_rate"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      )}
                    />
                    {errors.hourly_rate && (
                      <p className="text-red-500 text-sm mt-1">{errors.hourly_rate.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Years of Experience
                    </label>
                    <Controller
                      name="experience_years"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                          max="50"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      )}
                    />
                    {errors.experience_years && (
                      <p className="text-red-500 text-sm mt-1">{errors.experience_years.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Education
                    </label>
                    <Controller
                      name="education"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Degree, Institution"
                        />
                      )}
                    />
                    {errors.education && (
                      <p className="text-red-500 text-sm mt-1">{errors.education.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>

              {/* Profile Preview */}
              <div className="lg:block">
                <ProfilePreview
                  data={{
                    first_name: watch('first_name'),
                    last_name: watch('last_name'),
                    bio: watch('bio'),
                    location: watch('location'),
                    hourly_rate: watch('hourly_rate'),
                    experience_years: watch('experience_years'),
                    education: watch('education'),
                    skills: skills,
                    avatar: profile?.avatar
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Skills & Social Links
              </h3>
              
              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skills
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a skill..."
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Social Links
                </label>
                <div className="space-y-3">
                  {['LinkedIn', 'GitHub', 'Twitter', 'Website', 'Portfolio'].map((platform) => (
                    <div key={platform} className="flex gap-2">
                      <input
                        type="text"
                        value={socialLinks[platform] || ''}
                        onChange={(e) => updateSocialLink(platform, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`${platform} URL`}
                      />
                      {socialLinks[platform] && (
                        <button
                          onClick={() => removeSocialLink(platform)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    updateProfile({
                      skills: formatSkills(skills),
                      social_links: formatSocialLinks(socialLinks),
                    });
                  }}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Portfolio
              </h3>
              
              {/* Add/Edit Portfolio Item */}
              <form onSubmit={handlePortfolioSubmit(onSubmitPortfolio)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <Controller
                      name="title"
                      control={portfolioControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Project title"
                        />
                      )}
                    />
                    {portfolioErrors.title && (
                      <p className="text-red-500 text-sm mt-1">{portfolioErrors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL
                    </label>
                    <Controller
                      name="url"
                      control={portfolioControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://..."
                        />
                      )}
                    />
                    {portfolioErrors.url && (
                      <p className="text-red-500 text-sm mt-1">{portfolioErrors.url.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <Controller
                    name="description"
                    control={portfolioControl}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe your project..."
                      />
                    )}
                  />
                  {portfolioErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{portfolioErrors.description.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={portfolioSubmitting}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {portfolioSubmitting ? 'Saving...' : (editingPortfolio ? 'Update Item' : 'Add Item')}
                  </button>
                </div>
              </form>

              {/* Portfolio Items List */}
              <div className="space-y-4">
                {profile.portfolio_items.map((item) => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {item.description}
                          </p>
                        )}
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            View Project
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingPortfolio(item.id);
                            resetPortfolio({
                              title: item.title,
                              description: item.description || '',
                              url: item.url || '',
                              image: item.image || '',
                            });
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePortfolioItem(item.id)}
                          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Certificates
              </h3>
              
              {/* Add/Edit Certificate */}
              <form onSubmit={handleCertificateSubmit(onSubmitCertificate)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Certificate Name *
                    </label>
                    <Controller
                      name="name"
                      control={certificateControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Certificate name"
                        />
                      )}
                    />
                    {certificateErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{certificateErrors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Issuing Organization
                    </label>
                    <Controller
                      name="issuer"
                      control={certificateControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Organization name"
                        />
                      )}
                    />
                    {certificateErrors.issuer && (
                      <p className="text-red-500 text-sm mt-1">{certificateErrors.issuer.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Issue Date
                    </label>
                    <Controller
                      name="issue_date"
                      control={certificateControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expiration Date
                    </label>
                    <Controller
                      name="expiration_date"
                      control={certificateControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Credential ID
                    </label>
                    <Controller
                      name="credential_id"
                      control={certificateControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Credential ID"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Verification URL
                    </label>
                    <Controller
                      name="credential_url"
                      control={certificateControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://..."
                        />
                      )}
                    />
                    {certificateErrors.credential_url && (
                      <p className="text-red-500 text-sm mt-1">{certificateErrors.credential_url.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={certificateSubmitting}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {certificateSubmitting ? 'Saving...' : (editingCertificate ? 'Update Certificate' : 'Add Certificate')}
                  </button>
                </div>
              </form>

              {/* Certificates List */}
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCertificate(cert.id);
                            resetCertificate({
                              name: cert.name,
                              issuer: cert.issuer || '',
                              issue_date: cert.issue_date || '',
                              expiration_date: cert.expiration_date || '',
                              credential_id: cert.credential_id || '',
                              credential_url: cert.credential_url || '',
                              file: cert.file || '',
                            });
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCertificate(cert.id)}
                          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
