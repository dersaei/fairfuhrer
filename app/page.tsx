import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";
import heroImage from "@/public/fair-fuehrer-guide-hero.jpg";
import appStoreBadge from "@/public/app-store-badge.png";
import googlePlayBadge from "@/public/google-play-badge.png";
import seenergienLogo from "@/public/seenergienlogo.png";
import styles from "./page.module.css";
import { getHomePageContent, getFeaturedPins } from "@/lib/directus";
import FeaturedPinsMap from "@/components/FeaturedPinsMap";

const CATEGORIES = [
  { name: "Kultur & Natur", color: "#E45858" },
  { name: "Tourismus", color: "#6477E3" },
  { name: "Einkaufen", color: "#F0873D" },
  { name: "Umwelt", color: "#42D742" },
  { name: "Bildung", color: "#27B9B7" },
  { name: "Wirtschaft", color: "#E0D12E" },
] as const;

export default async function HomePage() {
  const [content, featuredPins] = await Promise.all([
    getHomePageContent(),
    getFeaturedPins(),
  ]);

  // Directus Color interface zapisuje hex bez "#" — np. "000000" zamiast "#000000"
  const c = (val?: string) =>
    val ? (val.startsWith("#") ? val : `#${val}`) : undefined;

  // Wszystkie wartości font-size i kolory jako CSS vars na <main>.
  // Desktop font-size: var(--fs-*), mobile font-size: var(--fs-*-mobile) — odczytywane przez media query w CSS.
  const cssVars = {
    ...(content?.hero_background_color && { "--hero-bg": c(content.hero_background_color) }),
    ...(content?.hero_title_font_size && { "--fs-hero-title": content.hero_title_font_size }),
    ...(content?.hero_title_color && { "--color-hero-title": c(content.hero_title_color) }),
    ...(content?.hero_title_mobile_font_size && { "--fs-hero-title-mobile": content.hero_title_mobile_font_size }),
    ...(content?.hero_title_mobile_color && { "--color-hero-title-mobile": c(content.hero_title_mobile_color) }),
    ...(content?.hero_subtitle_font_size && { "--fs-hero-subtitle": content.hero_subtitle_font_size }),
    ...(content?.hero_subtitle_color && { "--color-hero-subtitle": c(content.hero_subtitle_color) }),
    ...(content?.hero_button_font_size && { "--fs-hero-btn": content.hero_button_font_size }),
    ...(content?.hero_button_color && { "--color-hero-btn": c(content.hero_button_color) }),
    ...(content?.hero_button_background_color && { "--bg-hero-btn": c(content.hero_button_background_color) }),
    ...(content?.hero_button_mobile_font_size && { "--fs-hero-btn-mobile": content.hero_button_mobile_font_size }),
    ...(content?.hero_button_mobile_color && { "--color-hero-btn-mobile": c(content.hero_button_mobile_color) }),
    ...(content?.hero_button_background_color_mobile && { "--bg-hero-btn-mobile": c(content.hero_button_background_color_mobile) }),
    ...(content?.badges_label_font_size && { "--fs-badges-label": content.badges_label_font_size }),
    ...(content?.badges_label_color && { "--color-badges-label": c(content.badges_label_color) }),
    ...(content?.section2_background_color && { "--bg-s2": c(content.section2_background_color) }),
    ...(content?.section2_title_font_size && { "--fs-s2-title": content.section2_title_font_size }),
    ...(content?.section2_title_color && { "--color-s2-title": c(content.section2_title_color) }),
    ...(content?.section2_title_mobile_font_size && { "--fs-s2-title-mobile": content.section2_title_mobile_font_size }),
    ...(content?.category_name_font_size && { "--fs-cat-name": content.category_name_font_size }),
    ...(content?.category_name_color && { "--color-cat-name": c(content.category_name_color) }),
    ...(content?.category_name_mobile_font_size && { "--fs-cat-name-mobile": content.category_name_mobile_font_size }),
    ...(content?.section3_background_color && { "--bg-s3": c(content.section3_background_color) }),
    ...(content?.section3_title_font_size && { "--fs-s3-title": content.section3_title_font_size }),
    ...(content?.section3_title_color && { "--color-s3-title": c(content.section3_title_color) }),
    ...(content?.section3_title_mobile_font_size && { "--fs-s3-title-mobile": content.section3_title_mobile_font_size }),
    ...(content?.section3_button_color && { "--color-s3-btn": c(content.section3_button_color) }),
    ...(content?.section3_button_font_size && { "--fs-s3-btn": content.section3_button_font_size }),
    ...(content?.section3_button_background_color && { "--bg-s3-btn": c(content.section3_button_background_color) }),
    ...(content?.section4_background_color && { "--bg-s4": c(content.section4_background_color) }),
    ...(content?.section4_title_font_size && { "--fs-s4-title": content.section4_title_font_size }),
    ...(content?.section4_title_color && { "--color-s4-title": c(content.section4_title_color) }),
    ...(content?.section4_title_mobile_font_size && { "--fs-s4-title-mobile": content.section4_title_mobile_font_size }),
    ...(content?.section4_text_font_size && { "--fs-s4-text": content.section4_text_font_size }),
    ...(content?.section4_text_color && { "--color-s4-text": c(content.section4_text_color) }),
    ...(content?.section4_text_mobile_font_size && { "--fs-s4-text-mobile": content.section4_text_mobile_font_size }),
    ...(content?.section4_button_color && { "--color-s4-btn": c(content.section4_button_color) }),
    ...(content?.section4_button_font_size && { "--fs-s4-btn": content.section4_button_font_size }),
    ...(content?.section4_button_background_color && { "--bg-s4-btn": c(content.section4_button_background_color) }),
    ...(content?.section4_button_mobile_font_size && { "--fs-s4-btn-mobile": content.section4_button_mobile_font_size }),
  } as React.CSSProperties;

  const featuredPlaces = featuredPins.map((fp) => fp.ort);

  return (
    <>
      <main className={styles.main} style={cssVars}>
        {/* SEKCJA 1: Hero */}
        <div className={styles.heroContainer}>
          <div className={styles.heroImageSide}>
            <Image
              src={heroImage}
              alt="FairFührer Guide Hero"
              fill
              priority
              unoptimized
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className={styles.heroTextSide}>
            <h1 className={styles.heroTitle}>{content?.hero_title}</h1>
            <h3 className={styles.heroSubtitle}>{content?.hero_subtitle}</h3>
            <Link href={content?.hero_button_link ?? "#"} className={styles.heroButton}>
              <span>{content?.hero_button_text}</span>
            </Link>
          </div>
          {/* Mobile overlay — widoczne tylko poniżej 735px */}
          <h1 className={styles.heroTitleMobile}>{content?.hero_title}</h1>
          <Link href={content?.hero_button_link ?? "#"} className={styles.heroButtonMobile}>
            <span>{content?.hero_button_text}</span>
          </Link>
          <div className={styles.heroBadgesBar}>
            <span className={styles.heroBadgesLabel}>{content?.badges_label}</span>
            <div className={styles.heroBadgesIcons}>
              <Image
                src={appStoreBadge}
                alt="App Store"
                unoptimized
                className={styles.heroBadgeImg}
              />
              <Image
                src={googlePlayBadge}
                alt="Google Play"
                unoptimized
                className={styles.heroBadgeImg}
              />
            </div>
            <Image
              src={seenergienLogo}
              alt="Seenergien"
              unoptimized
              className={styles.heroBadgePartner}
            />
          </div>
        </div>

        {/* SEKCJA 2: Kategorie */}
        <section className={styles.section2}>
          <div className={styles.section2Content}>
            <h2 className={styles.section2Title}>
              {content?.section2_title}
            </h2>
            <div className={styles.categoriesList}>
              {CATEGORIES.map((cat) => (
                <div key={cat.name} className={styles.categoryItem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1000 1000"
                    width={30}
                    height={30}
                    aria-hidden="true"
                  >
                    <path
                      fill={cat.color}
                      d="M962.995836857042377,500c0,255.705539931290332-207.290296925752045,462.995836857042377-462.995836857042377,462.995836857042377S37.004163142957623,755.705539931290332,37.004163142957623,500,244.294460068709668,37.004163142957623,500,37.004163142957623s462.995836857042377,207.290296925752045,462.995836857042377,462.995836857042377ZM508.462807004492788,765.557879642494299c32.295274423360752-31.717979871915304,61.398425056295309-64.705735416888274,88.86108294629048-100.182903217853891,27.252939046478787-35.206246077648757,53.381264439884035-74.712953037065745,71.908230307632039-115.053517510783422,11.635811623560585-25.335784194512598,21.987736370989296-55.890074703775099,23.992395057173781-83.770125349476075,6.636739414887415-92.301314076308699-51.052121308532151-177.465194228258042-140.95611549367095-202.44117570211165-88.783876713643622-24.664804718357118-183.210701642656204,12.82997323946438-227.030490846484099,94.824974275692512-14.590524608653141,27.301593689569927-22.137261946543731,56.914834321527451-23.245849695334982,87.85764977648796-1.196403968497179,33.393934983592771,8.383243181164289,66.416728811887879,21.768367584894804,96.78302223348328,18.825694071349062,42.709095021664325,46.097114253214386,84.20361382721785,74.670211136157377,121.258388167147132,27.419309696579148,35.558495375064012,56.525268355140724,68.728174355837837,88.310306865942039,100.220028929235923,5.702665391501796,5.650064231600481,15.630649193606587,6.485987794550965,21.721862137399512.503658398178231Z"
                    />
                    <path
                      fill={cat.color}
                      d="M518.713085109016902,710.900336598806462l-20.813403098409253,22.137218490828673c-60.494382079210482-63.466418892561705-161.025183629197272-184.158505305142171-164.893695048927839-273.035594177606981-3.060281954843958-70.308426618099475,37.113103922974915-135.563591598351195,102.747960624423285-161.625879170145708,44.660036338747886-17.73360632631011,95.411279762713093-15.539472034430219,138.396783060179587,6.541545862179191,60.395037347829202,31.024038297637162,94.684887442206673,96.276771711727633,87.859812224025518,163.66148378813341-3.482230958259606,34.380446076396765-20.362436718884055,71.849312822670981-37.471994111841923,101.78997575775611-26.526197747964034,46.419198783492902-68.842273972844851,101.195781506023195-105.825463649449375,140.531249448855306ZM560.691686595200736,414.150887318648529c0-34.685290967468973-28.117983933922005-62.803274901390978-62.803274901390978-62.803274901390978s-62.803274901390978,28.117983933922005-62.803274901390978,62.803274901390978c0,34.685290967470792,28.117983933922005,62.803274901392797,62.803274901390978,62.803274901392797s62.803274901390978-28.117983933922005,62.803274901390978-62.803274901392797Z"
                    />
                    <circle
                      fill={cat.color}
                      cx="497.902920176099087"
                      cy="414.590907953081114"
                      r="32.369766744168601"
                    />
                  </svg>
                  <span className={styles.categoryName}>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SEKCJA 3: Mapa z featured pins */}
        {featuredPlaces.length > 0 && (
          <section className={styles.section3}>
            <h2 className={styles.section3Title}>
              {content?.section3_title}
            </h2>
            <FeaturedPinsMap places={featuredPlaces} />
            <div className={styles.section3ButtonRow}>
              <Link href="/karte" className={styles.section3Button}>
                <span>
                  {content?.section3_button_text}
                </span>
              </Link>
            </div>
          </section>
        )}

        {/* SEKCJA 4: Wsparcie */}
        <section className={styles.section4}>
          <div className={styles.section4Content}>
            <div className={styles.section4IconContainer}>
              <Heart size={32} className={styles.section4HeartIcon} />
              <Sparkles size={20} className={styles.section4SparkleIcon} />
            </div>
            <h2 className={styles.section4Title}>
              {content?.section4_title}
            </h2>
            {content?.section4_text?.split("\n\n").map((paragraph: string, i: number) => (
              <p
                key={i}
                className={styles.section4Text}
              >
                {paragraph}
              </p>
            ))}
            {content?.section4_button_text && content?.section4_button_link && (
              <Link
                href={content.section4_button_link}
                className={styles.section4Button}
              >
                {content.section4_button_text}
              </Link>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
