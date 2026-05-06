import { FaLinkedin } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/shared/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import type { Alumni } from "./alumni-types";


export function AlumniCard({
  name,
  image,
  currentPosition,
  description,
  formerTeam,
  period,
  linkedin,
}: Alumni) {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-start items-center gap-3">
        <Avatar>
          <AvatarImage src={image} />
          <AvatarFallback>{}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col justify-start items-start gap-0.5">
          <CardTitle>{name}</CardTitle>
          <CardDescription>{currentPosition}</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <p>{description}</p>
      </CardContent>

      <CardFooter className="flex flex-row justify-between items-center gap-2 text-md">
        <div>
          {formerTeam} • {period}
        </div>

        <div className="flex flex-row justify-end items-center gap-3">
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noopener noreferrer">
              <FaLinkedin size={20} />
            </a>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
