import I18n from "I18n";
import createPMRoute from "discourse/routes/build-private-messages-route";
import { findOrResetCachedTopicList } from "discourse/lib/cached-topic-list";

export default createPMRoute("groups", "private-messages-groups").extend({
  groupName: null,

  titleToken() {
    const groupName = this.groupName;
    if (groupName)
      return [groupName.capitalize(), I18n.t("user.private_messages")];
  },

  model(params) {
    const username = this.modelFor("user").get("username_lower");
    const filter = `topics/private-messages-group/${username}/${params.name}`;
    const lastTopicList = findOrResetCachedTopicList(this.session, filter);
    return lastTopicList
      ? lastTopicList
      : this.store.findFiltered("topicList", { filter });
  },

  afterModel(model) {
    const groupName = _.last(model.get("filter").split("/"));
    this.set("groupName", groupName);
    const groups = this.modelFor("user").get("groups");
    const group = _.first(groups.filterBy("name", groupName));
    this.controllerFor("user-private-messages").set("group", group);
  },

  setupController(controller, model) {
    this._super.apply(this, arguments);
    const group = _.last(model.get("filter").split("/"));
    this.controllerFor("user-private-messages").set("groupFilter", group);
    this.controllerFor("user-private-messages").set("archive", false);
    this.controllerFor("user-topics-list").subscribe(
      `/private-messages/group/${group}`
    );
  }
});
