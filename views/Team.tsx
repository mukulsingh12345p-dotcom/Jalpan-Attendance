import React, { useState, useRef } from 'react';
import { UserPlus, Search, Edit2, Trash2, MoreVertical, AlertTriangle, Save, Camera } from 'lucide-react';
import { Sewadar } from '../types';

interface TeamProps {
  members: Sewadar[];
  onAddMember: (name: string) => void;
  onRemoveMember: (id: string) => void;
  onUpdateMember: (id: string, updates: Partial<Sewadar>) => void;
}

const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_SIZE = 200; // Limit to 200px for storage efficiency
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        // Compress to 70% quality jpeg
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const Team: React.FC<TeamProps> = ({ members, onAddMember, onRemoveMember, onUpdateMember }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal States
  const [memberToEdit, setMemberToEdit] = useState<Sewadar | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [editPhoneValue, setEditPhoneValue] = useState('');
  const [memberToDelete, setMemberToDelete] = useState<Sewadar | null>(null);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  // Avatar Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingMemberId, setUploadingMemberId] = useState<string | null>(null);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (newMemberName.trim()) {
      onAddMember(newMemberName.trim());
      setNewMemberName('');
      setIsAdding(false);
      // Clear search so the new member is immediately visible if filter was active
      setSearchTerm(''); 
    }
  };

  const initiateEdit = (member: Sewadar) => {
    setMemberToEdit(member);
    setEditNameValue(member.name);
    setEditPhoneValue(member.phoneNumber || '');
    setActiveMenuId(null);
  };

  const saveEdit = () => {
    if (memberToEdit && editNameValue.trim()) {
      onUpdateMember(memberToEdit.id, { 
        name: editNameValue.trim(),
        phoneNumber: editPhoneValue.trim() || undefined
      });
      setMemberToEdit(null);
    }
  };

  const initiateDelete = (member: Sewadar) => {
    setMemberToDelete(member);
    setActiveMenuId(null);
  };

  const confirmDelete = () => {
    if (memberToDelete) {
      onRemoveMember(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  const handleAvatarClick = (id: string) => {
    setUploadingMemberId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingMemberId) {
      try {
        const resizedImage = await resizeImage(file);
        onUpdateMember(uploadingMemberId, { avatar: resizedImage });
      } catch (err) {
        console.error("Error processing image", err);
        alert("Failed to process image. Please try another one.");
      }
    }
    setUploadingMemberId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-4 pb-0 max-w-lg mx-auto w-full h-full flex flex-col relative">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {/* Fixed Top Section: Header, Search, Add Button */}
      <div className="shrink-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Sewadars</h2>
          <span className="bg-brand-100 text-brand-600 px-3 py-1 rounded-full text-xs font-semibold">
            {members.length} Total
          </span>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm shadow-sm"
            placeholder="Search team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full bg-brand-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 mb-6 hover:bg-brand-700 transition-colors shadow-lg shadow-brand-100"
          >
            <UserPlus size={18} />
            Add New Member
          </button>
        ) : (
          <div className="bg-white p-4 rounded-2xl shadow-inner border-2 border-brand-100 mb-6 animate-in fade-in slide-in-from-top-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">New Sewadar Name</label>
            <input
              autoFocus
              type="text"
              className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder-gray-400 font-medium shadow-sm"
              placeholder="E.g. Manjit Singh"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsAdding(false)} 
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAdd}
                disabled={!newMemberName.trim()}
                className="px-5 py-2.5 text-sm font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-md shadow-brand-100"
              >
                Add Member
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable List Section */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar -mr-2 pb-40">
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm relative group">
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => handleAvatarClick(member.id)}
                  className="w-10 h-10 rounded-full flex items-center justify-center relative cursor-pointer overflow-hidden group/avatar bg-gray-100 border border-gray-200 shrink-0"
                >
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-500 font-medium">{member.name.charAt(0)}</span>
                  )}
                  {/* Overlay for upload hint */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                    <Camera size={14} className="text-white" />
                  </div>
                </div>
                <div 
                  className="flex flex-col cursor-pointer"
                  onClick={() => setExpandedMemberId(expandedMemberId === member.id ? null : member.id)}
                >
                  <span className="font-semibold text-gray-900">{member.name}</span>
                  {expandedMemberId === member.id && (
                    <span className="text-xs text-brand-600 font-medium animate-in fade-in slide-in-from-top-1">
                      {member.phoneNumber || 'No phone number'}
                    </span>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => setActiveMenuId(activeMenuId === member.id ? null : member.id)}
                className={`text-gray-400 p-2 hover:bg-gray-50 rounded-full transition-colors ${activeMenuId === member.id ? 'bg-gray-50 text-brand-600' : ''}`}
              >
                <MoreVertical size={18} />
              </button>

              {/* Context Menu */}
              {activeMenuId === member.id && (
                <>
                {/* Backdrop for menu to close on click outside */}
                <div className="fixed inset-0 z-10 cursor-default" onClick={() => setActiveMenuId(null)}></div>
                <div className="absolute right-12 top-2 bg-white rounded-xl shadow-xl border border-gray-100 z-20 w-44 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <button 
                    onClick={() => {
                        handleAvatarClick(member.id);
                        setActiveMenuId(null);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 flex items-center gap-2 font-medium"
                  >
                    <Camera size={16} className="text-gray-400" /> Change Photo
                  </button>
                  <button 
                    onClick={() => initiateEdit(member)}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 flex items-center gap-2 font-medium"
                  >
                    <Edit2 size={16} className="text-gray-400" /> Edit
                  </button>
                  <button 
                    onClick={() => initiateDelete(member)}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
                </>
              )}
            </div>
          ))}
          {filteredMembers.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              No members found.
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {memberToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setMemberToEdit(null)} />
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative z-10 shadow-2xl animate-in fade-in zoom-in-95">
             <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Member</h3>
             
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Name</label>
             <input
              autoFocus
              type="text"
              className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium"
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
             />

             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Phone Number</label>
             <input
              type="tel"
              className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium"
              placeholder="+91 98765 43210"
              value={editPhoneValue}
              onChange={(e) => setEditPhoneValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
             />

             <div className="flex gap-3 justify-end">
               <button onClick={() => setMemberToEdit(null)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100">Cancel</button>
               <button onClick={saveEdit} className="px-5 py-2.5 text-sm font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 flex items-center gap-2">
                 <Save size={16} /> Save Changes
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setMemberToDelete(null)} />
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative z-10 shadow-2xl animate-in fade-in zoom-in-95 text-center">
             <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertTriangle size={24} />
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-2">Remove Member?</h3>
             <p className="text-gray-500 text-sm mb-6">
               Are you sure you want to remove <span className="font-bold text-gray-900">{memberToDelete.name}</span>? This action cannot be undone.
             </p>
             <div className="flex gap-3 justify-center">
               <button onClick={() => setMemberToDelete(null)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100">Cancel</button>
               <button onClick={confirmDelete} className="px-5 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-lg shadow-red-100">
                 Yes, Remove
               </button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db; /* gray-300 */
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af; /* gray-400 */
        }
      `}</style>
    </div>
  );
};