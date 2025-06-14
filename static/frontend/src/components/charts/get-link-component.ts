import { ComponentType } from 'react';
import {
  LinkHorizontal,
  LinkVertical,
  LinkRadial,
  LinkHorizontalStep,
  LinkVerticalStep,
  LinkRadialStep,
  LinkHorizontalCurve,
  LinkVerticalCurve,
  LinkRadialCurve,
  LinkHorizontalLine,
  LinkVerticalLine,
  LinkRadialLine,
} from '@visx/shape';

interface GetLinkComponentProps {
  layout: 'polar' | 'cartesian';
  linkType: 'diagonal' | 'step' | 'curve' | 'line';
  orientation: 'vertical' | 'horizontal';
}

type LinkComponent = ComponentType<any>;

export default function getLinkComponent({
  layout,
  linkType,
  orientation,
}: GetLinkComponentProps): LinkComponent {
  let LinkComponent: LinkComponent;

  if (layout === 'polar') {
    if (linkType === 'step') {
      LinkComponent = LinkRadialStep;
    } else if (linkType === 'curve') {
      LinkComponent = LinkRadialCurve;
    } else if (linkType === 'line') {
      LinkComponent = LinkRadialLine;
    } else {
      LinkComponent = LinkRadial;
    }
  } else if (orientation === 'vertical') {
    if (linkType === 'step') {
      LinkComponent = LinkVerticalStep;
    } else if (linkType === 'curve') {
      LinkComponent = LinkVerticalCurve;
    } else if (linkType === 'line') {
      LinkComponent = LinkVerticalLine;
    } else {
      LinkComponent = LinkVertical;
    }
  } else if (linkType === 'step') {
    LinkComponent = LinkHorizontalStep;
  } else if (linkType === 'curve') {
    LinkComponent = LinkHorizontalCurve;
  } else if (linkType === 'line') {
    LinkComponent = LinkHorizontalLine;
  } else {
    LinkComponent = LinkHorizontal;
  }
  return LinkComponent;
} 