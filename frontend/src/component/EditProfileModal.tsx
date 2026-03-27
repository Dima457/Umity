'use client'
import {useState , useEffect} from 'react';
interface EditProfileModalProps{
    isOpen:boolean;
    onClose: ()=>void;
    user:{bio?:string; avatar?:string};
    onSave:(data:{bio:string; avatar:string})=> Promise<void>;

}
export default function EditProfileModal ({isOpen,onClose,onSave,user}:EditProfileModalProps){
    const [ bio,setBio] = useState(user.bio||'');
    const [ avatar, setAvatar] = useState(user.avatar||'');
    const [ loading, setLoading] = useState(false);
    useEffect(()=>{
        setBio(user.bio||'');
        setAvatar(user.avatar||'');

    },[user, isOpen]);

    const handleSubmit = async ()=>{
        setLoading(true);
    
    try{
        await onSave({bio, avatar});
        onClose()
    }catch(error){
        console.error('error:', error);
    }finally{
        setLoading(false)
    };
};
if(!isOpen) return null;
return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-[#2D2D2D]">Редактировать профиль</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[#2D2D2D]">Аватарка</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full p-2 border border-[#E5E5E5] rounded focus:outline-none focus:border-[#D85D3F] focus:ring-1 focus:ring-[#D85D3F] transition-colors"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-[#2D2D2D]">О себе</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full p-2 border border-[#E5E5E5] rounded focus:outline-none focus:border-[#D85D3F] focus:ring-1 focus:ring-[#D85D3F] transition-colors resize-none"
              placeholder="Расскажите о себе..."
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-[#D85D3F] hover:bg-[#C04B2F] text-white py-2 rounded disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#2D2D2D] py-2 rounded transition-colors font-medium"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
