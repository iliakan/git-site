exports.deleteFull = async function(youtube, playlistId) {
  while(true) {
    let itemsToDelete = await youtube.playlistItems.list({
      part: 'id',
      playlistId,
      maxResults: 50
    });

    let items = itemsToDelete.data.items;

    if (items.length === 0) break;

    for(let item of items) {
      await youtube.playlistItems.delete({
        id: item.id
      });
    }
  }
};

exports.fetchItems = async function(youtube, playlistId) {
  let pageToken;
  let items = [];
  while (true) {

    let newItems = await youtube.playlistItems.list({
      part: 'id,snippet,contentDetails',
      playlistId: playlistId,
      maxResults: 50,
      pageToken
    });

    if (newItems.data.length === 0) break;

    items.push(...newItems.data.items);

    pageToken = newItems.data.nextPageToken;
    if (!pageToken) break;
  }

  return items;
};
