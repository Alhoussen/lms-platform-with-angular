import { RenderMode, ServerRoute } from '@angular/ssr';
import * as fs from 'fs';
import * as path from 'path';

async function getCourseIds(): Promise<string[]> {
  const dbPath = path.join(process.cwd(), 'db.json');
  const dbData = await fs.promises.readFile(dbPath, 'utf8');
  const db = JSON.parse(dbData);
  return db.courses.map((course: any) => course.id.toString());
}

export const serverRoutes: ServerRoute[] = [
  {
    path: 'courses/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      const ids = await getCourseIds();
      return ids.map(id => ({ id }));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
