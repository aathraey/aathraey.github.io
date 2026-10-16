window.PORTFOLIO_MOTION=[{duration:10}];
window.PORTFOLIO_WORKFLOW_PROGRESS=phase=>{
  const position=Math.max(0,Math.min(1,phase/.9));
  const departure=.08,arrival=.2,distance=1-(departure+arrival)/2;
  if(position<departure)return position*position/(2*departure*distance);
  if(position>1-arrival)return 1-(1-position)**2/(2*arrival*distance);
  return (position-departure/2)/distance;
};
