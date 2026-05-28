import Image from 'next/image';

export default function TopAppBar() {
  return (
    <header className="bg-surface h-row_height_standard px-gutter border-b border-outline-variant flex justify-between items-center shrink-0">
      <div className="flex items-center gap-4">
        <button className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-headline-sm font-headline-sm font-semibold text-on-surface">Inventario Farmacéutico</h2>
      </div>
      <div className="flex items-center gap-2">
        <button className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors flex items-center justify-center relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <button className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
        <img 
          alt="User Avatar" 
          className="w-8 h-8 rounded-full border border-outline-variant ml-2 object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCznMUjp39cgDOjhqZeE_ywg6kn7SMV0RCiF1ds69BR2hl6bDeFDqCJcTwgizN3uUeb7x4fjcE52CpKuvzzoK9kPABf8vDAorCOz0msYr11vRJcPd9Msy1Id4ETBDOtbnU_EZqe95XqJyr9Ja7_0ECKaW8RQjyoJ01Wo-jzT9WvGVrfbggjK0OIKSZhcWuxzlwkXEoIot9S68UdWLmGeaRCnBEhmBr6viL7SvsgX4aacidDZ3qER16AVguTue2kGC36AxsJcmanEyw"
        />
      </div>
    </header>
  );
}
