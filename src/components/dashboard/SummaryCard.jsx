function SummaryCard({ icon, label, value, description, tone = 'teal', context = 'Este mes' }) {
  const tones = {
    teal: 'bg-[#e5f7f4] text-[#117b7b]',
    blue: 'bg-[#eaf2ff] text-[#3a67ad]',
    orange: 'bg-[#fff3df] text-[#bd7419]',
    red: 'bg-[#ffebeb] text-[#c84b55]',
  };

  return (
    <article className="group card border border-slate-200 bg-white shadow-sm transition duration-300 starting:translate-y-2 starting:opacity-0 hover:-translate-y-0.5 hover:border-[#8dd5cd] hover:shadow-md">
      <div className="card-body gap-3 p-5">
        <div className="flex items-start justify-between">
          <span className={`grid size-11 place-items-center rounded-2xl transition duration-300 group-hover:scale-110 group-hover:-rotate-3 ${tones[tone]}`}>
            {icon}
          </span>
          <span className="text-xs font-medium text-slate-400">{context}</span>
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-[#19304a]">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
      </div>
    </article>
  );
}

export default SummaryCard;
