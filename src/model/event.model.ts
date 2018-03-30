export class Event{
  public endpoint: string;
  public title: string;
  public description: string;
  public category: string;
  public startTime: Date;
  public endTime: Date;
  public gatesOpen: Date;
  public venue: string;
  public isPublic: boolean;
  public isCancelled: boolean;
  public isFeatured: boolean;
  public startPrice: number;
  public flyer: string;
  public banner: string;

  constructor(endpoint: string, title: string, description: string, category: string, startTime: string, endTime: string,
              gatesOpen: string, venue: string, isPublic: boolean, isCancelled: boolean, isFeatured: boolean,
              startPrice: number, flyer: string, banner: string){
    this.endpoint = endpoint;
    this.title = title;
    this.description = description;
    this.category = category;
    this.startTime = new Date(startTime);
    this.endTime = new Date(endTime);
    this.gatesOpen = new Date(gatesOpen);
    this.venue = venue;
    this.isPublic = isPublic;
    this.isCancelled = isCancelled;
    this.isFeatured = isFeatured;
    this.startPrice = startPrice;
    this.flyer = flyer;
    this.banner = banner;
  }
}
