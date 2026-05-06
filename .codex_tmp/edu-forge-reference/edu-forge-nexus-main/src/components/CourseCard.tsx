import { Link } from "react-router-dom";
import { Star, Users, Clock, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  rating: number;
  students: number;
  lessons: number;
  duration: string;
  price: number;
  category: string;
  level: string;
}

const CourseCard = ({ id, title, instructor, thumbnail, rating, students, lessons, duration, price, category, level }: CourseCardProps) => {
  return (
    <Link
      to={`/courses/${id}`}
      className="group block rounded-xl bg-card card-shadow hover:card-shadow-hover transition-all duration-300 overflow-hidden"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="text-xs font-medium">
            {category}
          </Badge>
          <Badge variant="outline" className="text-xs bg-card/80 backdrop-blur-sm">
            {level}
          </Badge>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-heading font-semibold text-base leading-tight line-clamp-2 group-hover:text-secondary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{instructor}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
            {rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {students.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {lessons} ບົດ
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {duration}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t">
          <span className="font-heading font-bold text-lg text-secondary">
            {price === 0 ? "ຟຣີ" : `₭${price.toLocaleString()}`}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
