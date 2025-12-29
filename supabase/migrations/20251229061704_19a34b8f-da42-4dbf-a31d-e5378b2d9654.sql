-- Fix function search path for security
CREATE OR REPLACE FUNCTION create_recognition_notification()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.recognition_notifications (user_id, recognition_id, notification_type, title, message)
  VALUES (
    NEW.recipient_id,
    NEW.id,
    'received_recognition',
    'You received a recognition!',
    'Someone recognized you for: ' || NEW.title
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recognition_count INTEGER;
  given_count INTEGER;
  badge_rec RECORD;
BEGIN
  SELECT COUNT(*) INTO recognition_count
  FROM public.recognition_awards
  WHERE recipient_id = NEW.recipient_id AND status = 'approved';

  SELECT COUNT(*) INTO given_count
  FROM public.recognition_awards
  WHERE nominator_id = NEW.nominator_id AND status = 'approved';

  FOR badge_rec IN
    SELECT id, badge_code, badge_name, recognition_count_threshold
    FROM public.recognition_badges
    WHERE badge_type = 'milestone'
    AND recognition_count_threshold IS NOT NULL
    AND recognition_count_threshold <= recognition_count
  LOOP
    INSERT INTO public.employee_badges (employee_id, badge_id, awarded_reason)
    VALUES (NEW.recipient_id, badge_rec.id, 'Reached ' || badge_rec.recognition_count_threshold || ' recognitions')
    ON CONFLICT (employee_id, badge_id) DO NOTHING;
  END LOOP;

  FOR badge_rec IN
    SELECT id, badge_code, badge_name, recognition_count_threshold
    FROM public.recognition_badges
    WHERE badge_code LIKE 'giver_%'
    AND recognition_count_threshold IS NOT NULL
    AND recognition_count_threshold <= given_count
  LOOP
    INSERT INTO public.employee_badges (employee_id, badge_id, awarded_reason)
    VALUES (NEW.nominator_id, badge_rec.id, 'Given ' || badge_rec.recognition_count_threshold || ' recognitions')
    ON CONFLICT (employee_id, badge_id) DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;