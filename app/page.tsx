import Link from "next/link";

import { getHomeCardImages } from "@/lib/home-card-images";
import { getHomeRecommendedSpots } from "@/lib/home-recommended-spots";

export const dynamic = "force-dynamic";

export default async function Home() {
  const homeCardImages = await getHomeCardImages();

  const recommendedSpots = await getHomeRecommendedSpots(3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section
        className="relative isolate w-full overflow-hidden"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2400&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/60" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center text-white">
            <p className="text-xs font-semibold tracking-[0.22em] text-white/80 sm:text-sm">
              วางแผน • จัดของ • ออกเดินทาง
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
              CampWise
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-7 text-white/85 sm:text-lg">
              ค้นหาลานกางเต็นท์ จัดลิสต์อุปกรณ์ให้พร้อม และเรียนรู้เคล็ดลับ &amp;
              ทริคสำหรับสายแคมป์
            </p>

            <form
              action="/campgrounds"
              method="get"
              className="mx-auto mt-10 w-full max-w-2xl"
            >
              <div className="flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl sm:flex-row sm:items-center">
                <label className="flex-1">
                  <span className="sr-only">ค้นหา</span>
                  <input
                    name="q"
                    placeholder="ค้นหาสถานที่หรือจังหวัด"
                    className="h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-medium text-white outline-none placeholder:text-white/60 focus:border-accent focus:ring-2 focus:ring-accent/30"
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-slate-900 hover:bg-accent/90"
                >
                  ค้นหา
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/campgrounds"
            className="group overflow-hidden rounded-2xl border border-slate-200/60 bg-white/5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-xl dark:border-white/10"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-white/5">
              {homeCardImages.campgrounds ? (
                <>
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${homeCardImages.campgrounds})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 bg-slate-950/35"
                    aria-hidden="true"
                  />
                  <div className="relative flex h-full w-full items-center justify-center text-sm font-semibold tracking-wide text-white/90">
                    ลานกางเต็นท์
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200/60 to-slate-100/30 text-sm font-semibold tracking-wide text-slate-700/80 dark:from-white/10 dark:to-white/5 dark:text-white/70">
                  ลานกางเต็นท์
                </div>
              )}
            </div>

            <div className="p-6">
              <h2 className="text-lg font-extrabold tracking-tight text-foreground">
                ลานกางเต็นท์
              </h2>
              <p className="mt-2 text-base leading-7 text-foreground/70">
                ค้นหาลานกางเต็นท์จากไดเรกทอรี
              </p>
            </div>
          </Link>

          <Link
            href="/gear-lists"
            className="group overflow-hidden rounded-2xl border border-slate-200/60 bg-white/5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-xl dark:border-white/10"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-white/5">
              {homeCardImages.gearLists ? (
                <>
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${homeCardImages.gearLists})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 bg-slate-950/35"
                    aria-hidden="true"
                  />
                  <div className="relative flex h-full w-full items-center justify-center text-sm font-semibold tracking-wide text-white/90">
                    รายการอุปกรณ์
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200/60 to-slate-100/30 text-sm font-semibold tracking-wide text-slate-700/80 dark:from-white/10 dark:to-white/5 dark:text-white/70">
                  รายการอุปกรณ์
                </div>
              )}
            </div>

            <div className="p-6">
              <h2 className="text-lg font-extrabold tracking-tight text-foreground">
                รายการอุปกรณ์
              </h2>
              <p className="mt-2 text-base leading-7 text-foreground/70">
                ดูชุดอุปกรณ์พร้อมคำแนะนำจาก AI
              </p>
            </div>
          </Link>

          <Link
            href="/camping-hacks"
            className="group overflow-hidden rounded-2xl border border-slate-200/60 bg-white/5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-xl dark:border-white/10"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-white/5">
              {homeCardImages.tips ? (
                <>
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${homeCardImages.tips})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 bg-slate-950/35"
                    aria-hidden="true"
                  />
                  <div className="relative flex h-full w-full items-center justify-center text-sm font-semibold tracking-wide text-white/90">
                    เคล็ดลับ &amp; ทริค
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200/60 to-slate-100/30 text-sm font-semibold tracking-wide text-slate-700/80 dark:from-white/10 dark:to-white/5 dark:text-white/70">
                  เคล็ดลับ &amp; ทริค
                </div>
              )}
            </div>

            <div className="p-6">
              <h2 className="text-lg font-extrabold tracking-tight text-foreground">
                เคล็ดลับ &amp; ทริคแคมป์
              </h2>
              <p className="mt-2 text-base leading-7 text-foreground/70">
                ทิปส์สั้น ๆ ให้แคมป์ได้ฉลาดขึ้น
              </p>
            </div>
          </Link>
        </section>

        <section className="mt-12">
          <header className="mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight">
              สถานที่แนะนำ
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-7 text-foreground/70">
              ทริปแคมป์ที่คัดมาแล้ว เน้นวิว บรรยากาศ และเดินทางง่าย
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {recommendedSpots.map((spot) => {
              const detailHref = `/campground/${spot.id}`;

              return (
                <div
                  key={spot.title}
                  className="group overflow-hidden rounded-2xl border border-slate-200/60 bg-white/5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-xl dark:border-white/10"
                >
                  <div
                    className="aspect-video w-full bg-slate-100 dark:bg-white/5"
                    style={{
                      backgroundImage: spot.imageUrl
                        ? `url(${spot.imageUrl})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    aria-label={spot.title}
                  />

                  <div className="p-6">
                    <h3 className="text-lg font-extrabold tracking-tight">
                      {spot.title}
                    </h3>

                    <div className="mt-5">
                      <Link
                        href={detailHref}
                        className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200/60 bg-white/10 px-5 text-sm font-semibold text-foreground backdrop-blur hover:bg-white/15 dark:border-white/10"
                      >
                        ดูรายละเอียด
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
