import React, { useState } from 'react';
import { User, MapPin, DollarSign, Clock, Star } from 'lucide-react';
import { KYCModal } from './KYCModal';

interface ProfilePreviewProps {
  data: {
    first_name?: string;
    last_name?: string;
    bio?: string;
    location?: string;
    hourly_rate?: number;
    experience_years?: number;
    education?: string;
    skills: string[];
    avatar?: string;
  };
}

export const ProfilePreview: React.FC<ProfilePreviewProps> = ({ data }) => {
  const fullName = data.first_name && data.last_name 
    ? `${data.first_name} ${data.last_name}`
    : data.first_name || 'Your Name';

  const [kycOpen, setKycOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Profile Preview
      </h3>
      
      <div className="space-y-4">
        {/* Avatar and Name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
            {data.avatar ? (
              <img 
                src={data.avatar} 
                alt={fullName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-xl font-bold">
                {fullName[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {fullName}
            </h4>
            {data.location && (
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{data.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {data.bio && (
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {data.bio}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {data.hourly_rate && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-gray-600 dark:text-gray-400">
                ${data.hourly_rate}/hr
              </span>
            </div>
          )}
          
          {data.experience_years && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {data.experience_years} years experience
              </span>
            </div>
          )}
        </div>

        {/* Education */}
        {data.education && (
          <div>
            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Education
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {data.education}
            </p>
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Skills
            </h5>
            <div className="flex flex-wrap gap-1">
              {data.skills.slice(0, 5).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-xs"
                >
                  {skill}
                </span>
              ))}
              {data.skills.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                  +{data.skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Completion Indicator */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Profile Completion</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {Math.min(100, Math.max(0, 
                [
                  data.first_name,
                  data.last_name,
                  data.bio,
                  data.location,
                  data.hourly_rate,
                  data.experience_years,
                  data.education,
                  data.skills.length > 0
                ].filter(Boolean).length * 12.5
              )).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(100, Math.max(0, 
                  [
                    data.first_name,
                    data.last_name,
                    data.bio,
                    data.location,
                    data.hourly_rate,
                    data.experience_years,
                    data.education,
                    data.skills.length > 0
                  ].filter(Boolean).length * 12.5
                ))}%` 
              }}
            />
          </div>
        </div>
      </div>
      <button
        className="btn btn-outline mt-4"
        onClick={() => setKycOpen(true)}
      >
        KYC Verification
      </button>
      <KYCModal isOpen={kycOpen} onClose={() => setKycOpen(false)} />
    </div>
  );
}; 
