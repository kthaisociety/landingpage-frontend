"use client";

import { useState } from "react";
import Link from "next/link";
import { AlumniCard } from "@/components/alumni/alumni-card";
import { AlumniFilter } from "@/components/alumni/alumni-filter";
import type { Alumni } from "@/components/alumni/alumni-types";


export function AlumniView({ alumnis }: { alumnis: Alumni[] }) {


  const [selectedTeam, setSelectedTeam] = useState(alumnis);

  //Filtering function
  function handleTeamChange(team: string) {
    switch (team) {
      case "AI Team":
        setSelectedTeam(alumnis.filter((alumni) => alumni.formerTeam === "AI Team"));
        break;
      case "Business Team":
        setSelectedTeam(alumnis.filter((alumni) => alumni.formerTeam === "Business Team"));
        break;
      case "IT Team":
        setSelectedTeam(alumnis.filter((alumni) => alumni.formerTeam === "IT Team"));
        break;
      default:
        setSelectedTeam(alumnis);
        break;
    }
  }


  return (
    <div>
      <header className="bg-blue-600 text-white text-center p-4 h-16">Fake header</header>
      <main className="py-6 px-7 md:px-15 lg:px-20 xl:px-40 mb-10">
        <h4 className="hidden md:block my-9 font-light text-lg">
          <Link href="/">Home </Link> / <Link href="/alumni">Alumni</Link>
        </h4>
       

        {/* TODO: ADD alumni filitering Component here */}
        <div className="flex flex-col gap-3 mb-6">
          <h1 className="text-4xl font-semibold">Notable Alumni</h1>
          <p className="inline-block lg:max-w-[62%] mb-6">Here you’ll find some of the amazing people who’ve been part of the KTH AI Society. From shaping our community to exploring new frontiers in tech — their journeys continue to inspire us.</p>
          <AlumniFilter handleTeamChange={handleTeamChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {selectedTeam.map((alumni) => {
            return <AlumniCard {...alumni} key={alumni.name} />;
          })}
        </div>
      </main>
    </div>
  );
}
