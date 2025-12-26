"use client";

import { Member } from "@/entities/task/model/types";

interface Props {
  members: Member[];
}

export const TeamModal = ({ members }: Props) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-gray-400 text-sm">
          Наша команда работает над проектом
        </p>
        <p className="text-white font-semibold mt-1">Dashboard дизайн</p>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-4 p-4 bg-[#121218] rounded-xl border border-gray-800 hover:border-gray-700 transition-all"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${member.avatarColor}`}
            >
              {member.initials}
            </div>

            <div className="flex-grow">
              <h4 className="text-white font-medium">{member.name}</h4>
              <p className="text-gray-500 text-xs mt-1">Участник команды</p>
            </div>

            <div className="w-2 h-2 bg-green-500 rounded-full" title="В сети" />
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
        <p className="text-blue-400 text-xs text-center">
          👥 Команда: {members.length} участник{members.length > 1 ? (members.length < 5 ? 'а' : 'ов') : ''}
        </p>
      </div>
    </div>
  );
};
