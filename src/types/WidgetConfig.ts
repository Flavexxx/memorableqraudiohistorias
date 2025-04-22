
export interface WidgetTextConfig {
  title?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  relationLabel?: string;
  relationPlaceholder?: string;
  publishButton?: string;
  discardButton?: string;
  publishedStoriesTitle?: string;
  noStories?: string;
  audioReady?: string;
  footerMain?: string;
  footerSub?: string;
}

export interface WidgetStyleConfig {
  fontFamily?: string;
  backgroundColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  borderColor?: string;
  borderRadius?: string;
}

export interface WidgetConfig {
  texts?: WidgetTextConfig;
  styles?: WidgetStyleConfig;
}
