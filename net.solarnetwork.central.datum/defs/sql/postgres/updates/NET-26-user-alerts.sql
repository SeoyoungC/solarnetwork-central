/* Add index on user_node to assist finding all nodes for a given user. */
CREATE INDEX user_node_user_idx ON solaruser.user_node (user_id);

/**
 * Return most recent datum records for all available sources for all nodes owned by a given user ID.
 * 
 * @param users An array of user IDs to return results for.
 * @returns Set of solardatum.da_datum records.
 */
CREATE OR REPLACE FUNCTION solardatum.find_most_recent_for_user(users bigint[])
  RETURNS SETOF solardatum.da_datum AS
$BODY$
	SELECT r.* 
	FROM (SELECT node_id FROM solaruser.user_node WHERE user_id = ANY(users)) AS n,
	LATERAL (SELECT * FROM solardatum.find_most_recent(n.node_id)) AS r
	ORDER BY r.node_id, r.source_id;
$BODY$
  LANGUAGE sql STABLE;

/**
 * Return most recent datum records for all available sources for a given set of node IDs.
 * 
 * @param nodes An array of node IDs to return results for.
 * @returns Set of solardatum.da_datum records.
 */
CREATE OR REPLACE FUNCTION solardatum.find_most_recent(nodes solarcommon.node_ids)
  RETURNS SETOF solardatum.da_datum AS
$BODY$
	SELECT r.* 
	FROM (SELECT unnest(nodes) AS node_id) AS n,
	LATERAL (SELECT * FROM solardatum.find_most_recent(n.node_id)) AS r
	ORDER BY r.node_id, r.source_id;
$BODY$
  LANGUAGE sql STABLE;

/* === USER ALERTS ===================================================== */

CREATE TYPE solaruser.user_alert_status AS ENUM 
	('Active', 'Disabled', 'Suppressed');

CREATE TYPE solaruser.user_alert_type AS ENUM 
	('NodeStaleData');

CREATE TYPE solaruser.user_alert_sit_status AS ENUM 
	('Active', 'Resolved');

CREATE SEQUENCE solaruser.user_alert_seq;

CREATE TABLE solaruser.user_alert (
	id				BIGINT NOT NULL DEFAULT nextval('solaruser.user_alert_seq'),
	created			TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	user_id			BIGINT NOT NULL,
	node_id			BIGINT,
	valid_to		TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	alert_type		solaruser.user_alert_type NOT NULL,
	status			solaruser.user_alert_status NOT NULL,
	alert_opt		json,
	CONSTRAINT user_alert_pkey PRIMARY KEY (id),
	CONSTRAINT user_alert_user_fk FOREIGN KEY (user_id)
		REFERENCES solaruser.user_user (id) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE CASCADE,
	CONSTRAINT user_alert_node_fk FOREIGN KEY (node_id)
		REFERENCES solarnet.sn_node (node_id) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION
);

/* Add index on node_id so we can batch process in sets of nodes. */
CREATE INDEX user_alert_node_idx ON solaruser.user_alert (node_id);

/* Add index on valid_to so we can batch process only those alerts that need validation. */
CREATE INDEX user_alert_valid_idx ON solaruser.user_alert (valid_to);

CREATE TABLE solaruser.user_alert_sit (
	id				BIGINT NOT NULL DEFAULT nextval('solaruser.user_alert_seq'),
	created			TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	alert_id		BIGINT NOT NULL,
	status			solaruser.user_alert_sit_status NOT NULL,
	notified		TIMESTAMP WITH TIME ZONE,
	CONSTRAINT user_alert_sit_pkey PRIMARY KEY (id),
	CONSTRAINT user_alert_sit_alert_fk FOREIGN KEY (alert_id)
		REFERENCES solaruser.user_alert (id) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE CASCADE
);

/* Add index on valid_to so we can batch process only those alerts that need validation. */
CREATE INDEX user_alert_sit_alert_status_idx ON solaruser.user_alert_sit (alert_id, status);

/* Add a partial index on notified to support purging resolved situations. */
CREATE INDEX user_alert_sit_notified_idx ON solaruser.user_alert_sit (notified)
WHERE (notified is not null);

/**************************************************************************************************
 * FUNCTION solaruser.purge_resolved_situations(timestamp with time zone)
 * 
 * Delete user_alert_sit rows that have reached the Resolved state, and whose 
 * notified date is older than the given date.
 * 
 * @param older_date The maximum date to delete situations for.
 * @return The number of situations deleted.
 */
CREATE OR REPLACE FUNCTION solaruser.purge_resolved_situations(older_date timestamp with time zone)
  RETURNS BIGINT AS
$BODY$
DECLARE
	num_rows BIGINT := 0;
BEGIN
	DELETE FROM solaruser.user_alert_sit
	WHERE notified < older_date
		AND status = 'Resolved'::solaruser.user_alert_sit_status;
	GET DIAGNOSTICS num_rows = ROW_COUNT;
	RETURN num_rows;
END;$BODY$
  LANGUAGE plpgsql VOLATILE;
